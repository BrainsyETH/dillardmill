import { sql } from './client';
import { createBookingsTable } from './bookings';

export async function setupDatabase() {
  try {
    // Create booking_inquiries table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_inquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

        guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL,
        guest_phone TEXT,

        unit_id TEXT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        num_guests INTEGER NOT NULL,
        num_adults INTEGER,
        num_children INTEGER,

        message TEXT,
        special_requests TEXT,

        referral_source TEXT,

        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'declined', 'cancelled')),
        admin_notes TEXT,
        responded_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON booking_inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_inquiries_dates ON booking_inquiries(check_in, check_out);
      CREATE INDEX IF NOT EXISTS idx_inquiries_unit ON booking_inquiries(unit_id);
    `;

    // Create contact_submissions table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,

        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
        replied_at TIMESTAMP WITH TIME ZONE,
        notes TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
    `;

    // Create newsletter_subscribers table
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
      );
    `;

    // Create bookings table
    await createBookingsTable();

    console.log('✅ All database tables created successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Database setup error:', error);
    return { success: false, error };
  }
}
