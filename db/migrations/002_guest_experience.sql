-- Guest inquiries persist before email is attempted.
CREATE TABLE IF NOT EXISTS guest_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'inquiry')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  unit_slug TEXT,
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  message TEXT NOT NULL,
  owner_notified BOOLEAN NOT NULL DEFAULT false,
  CHECK (check_out IS NULL OR check_in IS NOT NULL AND check_out > check_in),
  CHECK (guests IS NULL OR guests BETWEEN 1 AND 100)
);
CREATE INDEX IF NOT EXISTS guest_messages_created ON guest_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS guest_messages_email ON guest_messages(email, created_at);

-- Each individual stay owns a distinct inventory slot. The Farm spans every
-- slot, including future units, so it cannot overlap an individual reservation.
CREATE TABLE IF NOT EXISTS rental_inventory (
  unit_id TEXT PRIMARY KEY,
  slot BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE
);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS inventory_span int8range;

CREATE OR REPLACE FUNCTION set_booking_inventory() RETURNS trigger AS $$
DECLARE unit_slot BIGINT;
BEGIN
  IF NEW.unit_slug = 'book-the-farm' THEN
    NEW.inventory_span := int8range(NULL, NULL, '()');
  ELSE
    INSERT INTO rental_inventory(unit_id) VALUES (NEW.unit_id)
      ON CONFLICT (unit_id) DO UPDATE SET unit_id = EXCLUDED.unit_id
      RETURNING slot INTO unit_slot;
    NEW.inventory_span := int8range(unit_slot, unit_slot + 1, '[)');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_inventory ON bookings;
CREATE TRIGGER bookings_inventory BEFORE INSERT OR UPDATE OF unit_id, unit_slug
  ON bookings FOR EACH ROW EXECUTE FUNCTION set_booking_inventory();
UPDATE bookings SET unit_slug = unit_slug;
ALTER TABLE bookings ALTER COLUMN inventory_span SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_inventory_no_overlap') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_inventory_no_overlap
      EXCLUDE USING gist (inventory_span WITH &&, daterange(check_in, check_out, '[)') WITH &&)
      WHERE (booking_status IN ('pending_payment', 'requested', 'confirmed'));
  END IF;
END $$;
