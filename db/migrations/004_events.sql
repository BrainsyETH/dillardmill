-- Event inquiries share the owner's message inbox. Wedding publishing remains off.
ALTER TABLE guest_messages DROP CONSTRAINT IF EXISTS guest_messages_kind_check;
ALTER TABLE guest_messages ADD CONSTRAINT guest_messages_kind_check CHECK (kind IN ('contact', 'inquiry', 'event'));
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS event_origin TEXT CHECK (event_origin IN ('website', 'owner'));
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS date_flexibility TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS overnight_guests INTEGER CHECK (overnight_guests BETWEEN 0 AND 50);
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS package_id TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS event_stage TEXT NOT NULL DEFAULT 'new' CHECK (event_stage IN ('new', 'replied', 'tour', 'closed'));
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS follow_up_on DATE;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE guest_messages ADD COLUMN IF NOT EXISTS guest_notified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS event_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES guest_messages(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'confirmed', 'released', 'expired')),
  expires_at TIMESTAMPTZ,
  reviewed_external_blocks TEXT[] NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_sent_at TIMESTAMPTZ,
  reminder_claimed_at TIMESTAMPTZ,
  CHECK (end_date > start_date),
  CHECK (status <> 'held' OR expires_at IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS event_one_active_reservation ON event_reservations(message_id) WHERE status IN ('held', 'confirmed');

-- One exclusion constraint spans direct lodging AND whole-property events.
-- A simultaneous website request and event hold cannot both reserve the nights.
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  event_id UUID UNIQUE REFERENCES event_reservations(id) ON DELETE CASCADE,
  inventory_span int8range NOT NULL,
  nights daterange NOT NULL,
  CHECK ((booking_id IS NOT NULL)::int + (event_id IS NOT NULL)::int = 1),
  EXCLUDE USING gist (inventory_span WITH &&, nights WITH &&)
);
INSERT INTO inventory_reservations(booking_id, inventory_span, nights)
SELECT id, inventory_span, daterange(check_in, check_out, '[)') FROM bookings
WHERE booking_status IN ('pending_payment', 'requested', 'confirmed')
ON CONFLICT (booking_id) DO UPDATE SET inventory_span = EXCLUDED.inventory_span, nights = EXCLUDED.nights;

CREATE OR REPLACE FUNCTION reserve_booking_inventory() RETURNS trigger AS $$
BEGIN
  -- Reclaim expired holds even if a scheduled job has not run yet.
  DELETE FROM inventory_reservations i USING event_reservations e
    WHERE i.event_id = e.id AND e.status = 'held' AND e.expires_at <= now();
  IF NEW.booking_status IN ('pending_payment', 'requested', 'confirmed') THEN
    INSERT INTO inventory_reservations(booking_id, inventory_span, nights)
      VALUES (NEW.id, NEW.inventory_span, daterange(NEW.check_in, NEW.check_out, '[)'))
      ON CONFLICT (booking_id) DO UPDATE SET inventory_span = EXCLUDED.inventory_span, nights = EXCLUDED.nights;
  ELSE
    DELETE FROM inventory_reservations WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS bookings_shared_inventory ON bookings;
CREATE TRIGGER bookings_shared_inventory AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION reserve_booking_inventory();

CREATE OR REPLACE FUNCTION reserve_event_inventory() RETURNS trigger AS $$
BEGIN
  DELETE FROM inventory_reservations i USING event_reservations e
    WHERE i.event_id = e.id AND e.status = 'held' AND e.expires_at <= now();
  IF NEW.status = 'confirmed' OR (NEW.status = 'held' AND NEW.expires_at > now()) THEN
    -- Calendar blocks and imported reservations are checked here as well as in
    -- the UI. Existing bookings/event holds are guarded by the exclusion above.
    IF EXISTS (SELECT 1 FROM calendar_blocks WHERE start_date < NEW.end_date AND end_date > NEW.start_date)
       OR EXISTS (SELECT 1 FROM external_bookings WHERE check_in < NEW.end_date AND check_out > NEW.start_date AND kind = 'reservation')
       OR EXISTS (SELECT 1 FROM external_bookings WHERE check_in < NEW.end_date AND check_out > NEW.start_date AND kind = 'block'
         AND (TG_OP = 'INSERT' OR NEW.status = 'confirmed')
         AND NOT ((unit_id || '|' || source || '|' || check_in::text || '|' || check_out::text) = ANY(NEW.reviewed_external_blocks))) THEN
      RAISE EXCEPTION 'These dates overlap a blocked date or an imported reservation.' USING ERRCODE = '23P01';
    END IF;
    INSERT INTO inventory_reservations(event_id, inventory_span, nights)
      VALUES (NEW.id, int8range(NULL, NULL, '()'), daterange(NEW.start_date, NEW.end_date, '[)'))
      ON CONFLICT (event_id) DO UPDATE SET inventory_span = EXCLUDED.inventory_span, nights = EXCLUDED.nights;
  ELSE
    DELETE FROM inventory_reservations WHERE event_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS events_shared_inventory ON event_reservations;
CREATE TRIGGER events_shared_inventory AFTER INSERT OR UPDATE OF status, start_date, end_date, expires_at ON event_reservations
  FOR EACH ROW EXECUTE FUNCTION reserve_event_inventory();
