import { sql } from './client';

export interface Booking {
  id?: string;
  created_at?: string;

  // Guest info
  guest_name: string;
  guest_email: string;
  guest_phone?: string;

  // Stay details
  unit_id: string;
  unit_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  num_nights: number;

  // Pricing
  base_price: number;        // Per night rate
  cleaning_fee: number;
  total_amount: number;      // In cents

  // Payment
  payment_id?: string;       // Square payment ID
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method?: string;

  // Status
  booking_status: 'confirmed' | 'cancelled' | 'completed';

  // Additional
  special_requests?: string;
  confirmation_code?: string;
}

// Create confirmed booking table
export async function createBookingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,

      unit_id TEXT NOT NULL,
      unit_name TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      num_guests INTEGER NOT NULL,
      num_nights INTEGER NOT NULL,

      base_price INTEGER NOT NULL,
      cleaning_fee INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,

      payment_id TEXT,
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
      payment_method TEXT,

      booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),

      special_requests TEXT,
      confirmation_code TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
    CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings(unit_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(guest_email);
    CREATE INDEX IF NOT EXISTS idx_bookings_confirmation ON bookings(confirmation_code);
  `;
}

export async function createBooking(booking: Booking) {
  // Generate confirmation code
  const confirmationCode = `PV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  const result = await sql`
    INSERT INTO bookings (
      guest_name, guest_email, guest_phone,
      unit_id, unit_name,
      check_in, check_out,
      num_guests, num_nights,
      base_price, cleaning_fee, total_amount,
      payment_id, payment_status, payment_method,
      booking_status,
      special_requests,
      confirmation_code
    )
    VALUES (
      ${booking.guest_name}, ${booking.guest_email}, ${booking.guest_phone},
      ${booking.unit_id}, ${booking.unit_name},
      ${booking.check_in}, ${booking.check_out},
      ${booking.num_guests}, ${booking.num_nights},
      ${booking.base_price}, ${booking.cleaning_fee}, ${booking.total_amount},
      ${booking.payment_id}, ${booking.payment_status}, ${booking.payment_method},
      ${booking.booking_status},
      ${booking.special_requests},
      ${confirmationCode}
    )
    RETURNING *
  `;

  return result[0];
}

export async function getBookingByConfirmation(code: string) {
  const result = await sql`
    SELECT * FROM bookings
    WHERE confirmation_code = ${code}
  `;

  return result[0];
}

export async function getBookingsByEmail(email: string) {
  const result = await sql`
    SELECT * FROM bookings
    WHERE guest_email = ${email}
    ORDER BY check_in DESC
  `;

  return result;
}

// Check if unit is available for given dates
export async function checkAvailability(
  unitId: string,
  checkIn: string,
  checkOut: string
) {
  const result = await sql`
    SELECT * FROM bookings
    WHERE unit_id = ${unitId}
      AND booking_status = 'confirmed'
      AND (
        (check_in <= ${checkIn} AND check_out > ${checkIn})
        OR (check_in < ${checkOut} AND check_out >= ${checkOut})
        OR (check_in >= ${checkIn} AND check_out <= ${checkOut})
      )
  `;

  return result.length === 0; // true if available
}

export async function getBookedDates(unitId: string, startDate: string, endDate: string) {
  const result = await sql`
    SELECT check_in, check_out FROM bookings
    WHERE unit_id = ${unitId}
      AND booking_status = 'confirmed'
      AND check_in <= ${endDate}
      AND check_out >= ${startDate}
    ORDER BY check_in
  `;

  return result;
}

export async function updateBookingPayment(
  id: string,
  paymentId: string,
  paymentStatus: string
) {
  const result = await sql`
    UPDATE bookings
    SET
      payment_id = ${paymentId},
      payment_status = ${paymentStatus}
    WHERE id = ${id}
    RETURNING *
  `;

  return result[0];
}

export async function cancelBooking(id: string) {
  const result = await sql`
    UPDATE bookings
    SET booking_status = 'cancelled'
    WHERE id = ${id}
    RETURNING *
  `;

  return result[0];
}
