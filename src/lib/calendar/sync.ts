import ICAL from 'ical.js';
import { sql } from '../db/client';

interface ExternalBooking {
  unitId: string;
  checkIn: string;
  checkOut: string;
  guestName?: string;
  source: 'airbnb' | 'hipcamp' | 'vrbo';
}

// Create external_bookings table for synced calendar data
export async function createExternalBookingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS external_bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

      unit_id TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guest_name TEXT,
      source TEXT NOT NULL CHECK (source IN ('airbnb', 'hipcamp', 'vrbo')),
      external_id TEXT,

      UNIQUE(unit_id, check_in, source)
    );

    CREATE INDEX IF NOT EXISTS idx_external_bookings_unit ON external_bookings(unit_id);
    CREATE INDEX IF NOT EXISTS idx_external_bookings_dates ON external_bookings(check_in, check_out);
  `;
}

// Fetch iCal feed from URL
export async function fetchICalFeed(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Pine Valley Booking System',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
  }

  return response.text();
}

// Parse iCal feed and extract bookings
export function parseICalFeed(icalData: string): Array<{checkIn: string; checkOut: string; guestName?: string}> {
  const jcalData = ICAL.parse(icalData);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const bookings: Array<{checkIn: string; checkOut: string; guestName?: string}> = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.startDate && event.endDate) {
      // Get dates in YYYY-MM-DD format
      const checkIn = event.startDate.toJSDate().toISOString().split('T')[0];
      const checkOut = event.endDate.toJSDate().toISOString().split('T')[0];

      // Try to extract guest name from summary or description
      const summary = event.summary || '';
      const guestName = summary.replace(/^(Reserved|Blocked|Booked):?\s*/i, '').trim();

      bookings.push({
        checkIn,
        checkOut,
        guestName: guestName || undefined,
      });
    }
  }

  return bookings;
}

// Sync external calendar for a specific unit
export async function syncExternalCalendar(
  unitId: string,
  icalUrl: string,
  source: 'airbnb' | 'hipcamp' | 'vrbo'
) {
  try {
    // Fetch and parse iCal feed
    const icalData = await fetchICalFeed(icalUrl);
    const bookings = parseICalFeed(icalData);

    // Clear old bookings from this source for this unit
    await sql`
      DELETE FROM external_bookings
      WHERE unit_id = ${unitId}
        AND source = ${source}
        AND check_out < CURRENT_DATE
    `;

    // Insert new bookings
    for (const booking of bookings) {
      await sql`
        INSERT INTO external_bookings (unit_id, check_in, check_out, guest_name, source)
        VALUES (${unitId}, ${booking.checkIn}, ${booking.checkOut}, ${booking.guestName}, ${source})
        ON CONFLICT (unit_id, check_in, source)
        DO UPDATE SET
          check_out = EXCLUDED.check_out,
          guest_name = EXCLUDED.guest_name,
          updated_at = NOW()
      `;
    }

    console.log(`✅ Synced ${bookings.length} bookings from ${source} for unit ${unitId}`);
    return { success: true, count: bookings.length };
  } catch (error) {
    console.error(`❌ Error syncing ${source} calendar:`, error);
    return { success: false, error };
  }
}

// Sync all units' external calendars
export async function syncAllExternalCalendars() {
  // Get all units with iCal URLs from Sanity
  const { createClient } = await import('@sanity/client');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const units = await client.fetch(`
    *[_type == "rentalUnit"] {
      _id,
      name,
      airbnbIcalUrl,
      hipcampIcalUrl,
      vrboIcalUrl
    }
  `);

  const results = [];

  for (const unit of units) {
    if (unit.airbnbIcalUrl) {
      const result = await syncExternalCalendar(unit._id, unit.airbnbIcalUrl, 'airbnb');
      results.push({ unit: unit.name, source: 'airbnb', ...result });
    }

    if (unit.hipcampIcalUrl) {
      const result = await syncExternalCalendar(unit._id, unit.hipcampIcalUrl, 'hipcamp');
      results.push({ unit: unit.name, source: 'hipcamp', ...result });
    }

    if (unit.vrboIcalUrl) {
      const result = await syncExternalCalendar(unit._id, unit.vrboIcalUrl, 'vrbo');
      results.push({ unit: unit.name, source: 'vrbo', ...result });
    }
  }

  return results;
}

// Check if dates are available (including external bookings)
export async function checkAvailabilityWithExternal(
  unitId: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  // Check internal bookings
  const internalResult = await sql`
    SELECT * FROM bookings
    WHERE unit_id = ${unitId}
      AND booking_status = 'confirmed'
      AND (
        (check_in <= ${checkIn} AND check_out > ${checkIn})
        OR (check_in < ${checkOut} AND check_out >= ${checkOut})
        OR (check_in >= ${checkIn} AND check_out <= ${checkOut})
      )
  `;

  if (internalResult.length > 0) {
    return false; // Dates conflict with internal booking
  }

  // Check external bookings
  const externalResult = await sql`
    SELECT * FROM external_bookings
    WHERE unit_id = ${unitId}
      AND (
        (check_in <= ${checkIn} AND check_out > ${checkIn})
        OR (check_in < ${checkOut} AND check_out >= ${checkOut})
        OR (check_in >= ${checkIn} AND check_out <= ${checkOut})
      )
  `;

  return externalResult.length === 0; // Available if no conflicts
}

// Get all booked dates including external sources
export async function getAllBookedDates(
  unitId: string,
  startDate: string,
  endDate: string
) {
  const result = await sql`
    SELECT check_in, check_out, 'internal' as source FROM bookings
    WHERE unit_id = ${unitId}
      AND booking_status = 'confirmed'
      AND check_in <= ${endDate}
      AND check_out >= ${startDate}

    UNION ALL

    SELECT check_in, check_out, source FROM external_bookings
    WHERE unit_id = ${unitId}
      AND check_in <= ${endDate}
      AND check_out >= ${startDate}

    ORDER BY check_in
  `;

  return result;
}
