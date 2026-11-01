-- Booking engine schema: request-to-book, Airbnb/Hipcamp/VRBO iCal sync,
-- manual calendar blocks.
--
-- Idempotent: safe on an empty database and on one where the older
-- runtime-created tables (src/lib/db/setup.ts) already exist.
-- All money columns are integer cents.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------------
-- Inquiries / contact / newsletter (unchanged from the original setup)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
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
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  responded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  replied_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Direct bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
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
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  booking_status TEXT DEFAULT 'pending_payment',
  special_requests TEXT,
  confirmation_code TEXT
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS unit_slug TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS num_pets INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tax_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS decision_note TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refunded_amount INTEGER NOT NULL DEFAULT 0;

-- base_price now holds the lodging total for the stay (cents), cleaning_fee
-- the cleaning fee (cents); the full breakdown lives in `quote`.
COMMENT ON COLUMN bookings.base_price IS 'Lodging total for all nights, cents';
COMMENT ON COLUMN bookings.cleaning_fee IS 'Cleaning fee, cents';
COMMENT ON COLUMN bookings.total_amount IS 'Amount authorized/charged incl. tax, cents';

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check CHECK (
  booking_status IN (
    'pending_payment', -- dates held while the card is being authorized
    'requested',       -- card authorized, awaiting owner approval
    'confirmed',       -- owner approved, payment captured
    'declined',        -- owner declined, authorization voided
    'expired',         -- owner did not respond in time, authorization voided
    'cancelled',       -- cancelled after confirmation (refund recorded separately)
    'completed',
    'failed'           -- authorization failed; dates released
  )
);
ALTER TABLE bookings ALTER COLUMN booking_status SET DEFAULT 'pending_payment';

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check CHECK (
  payment_status IN (
    'pending', 'authorized', 'paid', 'voided',
    'refunded', 'partially_refunded', 'failed'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_confirmation_unique
  ON bookings(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_unit ON bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- Two active bookings can never share a night of the same unit. This is the
-- authoritative double-booking guard; application checks are a courtesy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
      EXCLUDE USING gist (
        unit_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
      )
      WHERE (booking_status IN ('pending_payment', 'requested', 'confirmed'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Owner-entered blocks (maintenance, personal use, phone bookings)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  unit_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL, -- exclusive, like a check-out date
  note TEXT,
  CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_unit ON calendar_blocks(unit_id, start_date);

-- ---------------------------------------------------------------------------
-- Reservations imported from Airbnb / Hipcamp / VRBO iCal feeds.
-- Each sync replaces the full set for (unit_id, source).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS external_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  unit_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_name TEXT,
  source TEXT NOT NULL,
  external_id TEXT
);
ALTER TABLE external_bookings ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE external_bookings
  DROP CONSTRAINT IF EXISTS external_bookings_unit_id_check_in_source_key;
CREATE INDEX IF NOT EXISTS idx_external_bookings_unit
  ON external_bookings(unit_id, source);
CREATE INDEX IF NOT EXISTS idx_external_bookings_dates
  ON external_bookings(check_in, check_out);

CREATE TABLE IF NOT EXISTS calendar_sync_status (
  unit_id TEXT NOT NULL,
  source TEXT NOT NULL,
  last_attempt_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  event_count INTEGER,
  PRIMARY KEY (unit_id, source)
);
