-- Property data moves from Sanity into Postgres, edited in /admin.
--
-- Business data the booking engine depends on (stays, prices, seasons, fees,
-- taxes, policies, booking switches, calendar links) lives here. Display
-- content (descriptions, photos, journal) lives in src/lib/content/.
-- All money is integer cents.

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  short_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Shown on the website at all.
  listed BOOLEAN NOT NULL DEFAULT true,
  -- Guests can send booking requests (card hold) online.
  direct_booking_enabled BOOLEAN NOT NULL DEFAULT false,
  -- Renting this unit takes every other unit off the market (the Farm).
  is_whole_property BOOLEAN NOT NULL DEFAULT false,
  base_price_cents INTEGER NOT NULL DEFAULT 0 CHECK (base_price_cents >= 0),
  cleaning_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (cleaning_fee_cents >= 0),
  max_guests INTEGER NOT NULL CHECK (max_guests BETWEEN 1 AND 500),
  base_guests INTEGER CHECK (base_guests >= 1),
  extra_guest_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (extra_guest_fee_cents >= 0),
  pets_allowed BOOLEAN NOT NULL DEFAULT false,
  max_pets INTEGER NOT NULL DEFAULT 0 CHECK (max_pets >= 0),
  pet_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (pet_fee_cents >= 0),
  min_stay INTEGER NOT NULL DEFAULT 1 CHECK (min_stay BETWEEN 1 AND 60),
  -- Calendar export links FROM each platform (imported read-only).
  -- Empty = that platform is managed by hand.
  airbnb_ical_url TEXT,
  hipcamp_ical_url TEXT,
  vrbo_ical_url TEXT,
  -- Public listing pages, for "also on Airbnb" links.
  airbnb_url TEXT,
  hipcamp_url TEXT,
  vrbo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (base_guests IS NULL OR base_guests <= max_guests),
  CHECK (NOT direct_booking_enabled OR base_price_cents > 0)
);
-- At most one whole-property listing.
CREATE UNIQUE INDEX IF NOT EXISTS units_one_whole_property
  ON units (is_whole_property) WHERE is_whole_property;

CREATE TABLE IF NOT EXISTS seasonal_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL, -- inclusive: last night at this rate
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS seasonal_rates_unit ON seasonal_rates(unit_id, start_date);

CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  rate_percent NUMERIC(6, 3) NOT NULL CHECK (rate_percent > 0 AND rate_percent <= 30),
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Single-row settings table.
CREATE TABLE IF NOT EXISTS site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  cancellation_policy TEXT,
  house_rules TEXT,
  check_in_time TEXT,
  check_out_time TEXT,
  request_response_hours INTEGER NOT NULL DEFAULT 24
    CHECK (request_response_hours BETWEEN 1 AND 144),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- Starting inventory from the published site. Prices are left at zero and
-- online requests off: the owner sets both in /admin before going live.
INSERT INTO units (id, slug, name, sort_order, max_guests, pets_allowed, max_pets, min_stay,
                   is_whole_property, airbnb_url, hipcamp_url)
VALUES
  ('cozy-cottage', 'cozy-cottage', 'Cozy Cottage', 10, 4, true, 2, 1, false,
   'https://www.airbnb.com/rooms/29332611',
   'https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd/sites/374668'),
  ('original-airstream', 'original-airstream', 'The Original Airstream', 20, 2, true, 2, 1, false,
   'https://www.airbnb.com/rooms/27518141',
   'https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd/sites/373911'),
  ('the-sebastian', 'the-sebastian', 'The Sebastian', 30, 4, true, 2, 1, false,
   'https://www.airbnb.com/rooms/29634317',
   'https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd/sites/419983'),
  ('book-the-farm', 'book-the-farm', 'Book the Farm', 40, 50, false, 0, 2, true,
   'https://www.airbnb.com/rooms/44360355', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Whole-property inventory is identified by the units flag, not by a slug.
CREATE OR REPLACE FUNCTION set_booking_inventory() RETURNS trigger AS $$
DECLARE unit_slot BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM units WHERE id = NEW.unit_id AND is_whole_property) THEN
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
UPDATE bookings SET unit_id = unit_id;

-- Imported calendar events: a real reservation, or a block ("Not available").
-- Only reservations are ever passed on to other platforms; blocks are often
-- echoes of our own bookings and forwarding them creates loops.
ALTER TABLE external_bookings ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'reservation';
ALTER TABLE external_bookings DROP CONSTRAINT IF EXISTS external_bookings_kind_check;
ALTER TABLE external_bookings ADD CONSTRAINT external_bookings_kind_check
  CHECK (kind IN ('reservation', 'block'));
