// Postgres access for property data edited in /admin: stays, seasonal rates,
// taxes, and booking settings. All money is integer cents here.

import { sql } from "@/lib/db/client";
import { dbDate } from "@/lib/booking/dates";

export interface UnitRecord {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  sortOrder: number;
  listed: boolean;
  directBookingEnabled: boolean;
  isWholeProperty: boolean;
  basePriceCents: number;
  cleaningFeeCents: number;
  maxGuests: number;
  baseGuests: number | null;
  extraGuestFeeCents: number;
  petsAllowed: boolean;
  maxPets: number;
  petFeeCents: number;
  minStay: number;
  airbnbIcalUrl: string | null;
  hipcampIcalUrl: string | null;
  vrboIcalUrl: string | null;
  airbnbUrl: string | null;
  hipcampUrl: string | null;
  vrboUrl: string | null;
  seasons: SeasonRecord[];
}

export interface SeasonRecord {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceCents: number;
}

export interface TaxRecord {
  id: string;
  name: string;
  ratePercent: number;
}

export interface SettingsRecord {
  cancellationPolicy: string | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  requestResponseHours: number;
}

type Row = Record<string, unknown>;
const str = (v: unknown) => (v == null ? null : String(v));

function toUnit(r: Row, seasons: SeasonRecord[]): UnitRecord {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    shortDescription: str(r.short_description),
    sortOrder: Number(r.sort_order),
    listed: Boolean(r.listed),
    directBookingEnabled: Boolean(r.direct_booking_enabled),
    isWholeProperty: Boolean(r.is_whole_property),
    basePriceCents: Number(r.base_price_cents),
    cleaningFeeCents: Number(r.cleaning_fee_cents),
    maxGuests: Number(r.max_guests),
    baseGuests: r.base_guests == null ? null : Number(r.base_guests),
    extraGuestFeeCents: Number(r.extra_guest_fee_cents),
    petsAllowed: Boolean(r.pets_allowed),
    maxPets: Number(r.max_pets),
    petFeeCents: Number(r.pet_fee_cents),
    minStay: Number(r.min_stay),
    airbnbIcalUrl: str(r.airbnb_ical_url),
    hipcampIcalUrl: str(r.hipcamp_ical_url),
    vrboIcalUrl: str(r.vrbo_ical_url),
    airbnbUrl: str(r.airbnb_url),
    hipcampUrl: str(r.hipcamp_url),
    vrboUrl: str(r.vrbo_url),
    seasons,
  };
}

function toSeason(r: Row): SeasonRecord {
  return {
    id: String(r.id),
    name: String(r.name),
    startDate: dbDate(r.start_date),
    endDate: dbDate(r.end_date),
    priceCents: Number(r.price_cents),
  };
}

async function withSeasons(rows: Row[]): Promise<UnitRecord[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => String(r.id));
  const seasonRows = await sql`
    SELECT * FROM seasonal_rates WHERE unit_id = ANY(${ids}::text[]) ORDER BY start_date
  `;
  return rows.map((r) =>
    toUnit(r, seasonRows.filter((s) => s.unit_id === r.id).map(toSeason)),
  );
}

export async function listUnits(): Promise<UnitRecord[]> {
  return withSeasons(await sql`SELECT * FROM units ORDER BY sort_order, name`);
}

export async function getUnitBySlug(slug: string): Promise<UnitRecord | null> {
  const [unit] = await withSeasons(
    await sql`SELECT * FROM units WHERE slug = ${slug}`,
  );
  return unit ?? null;
}

export async function getUnitById(id: string): Promise<UnitRecord | null> {
  const [unit] = await withSeasons(
    await sql`SELECT * FROM units WHERE id = ${id}`,
  );
  return unit ?? null;
}

export type UnitInput = Omit<UnitRecord, "id" | "seasons">;

export async function createUnit(input: UnitInput): Promise<string> {
  const rows = await sql`
    INSERT INTO units (
      slug, name, short_description, sort_order, listed, direct_booking_enabled,
      is_whole_property, base_price_cents, cleaning_fee_cents, max_guests, base_guests,
      extra_guest_fee_cents, pets_allowed, max_pets, pet_fee_cents, min_stay,
      airbnb_ical_url, hipcamp_ical_url, vrbo_ical_url, airbnb_url, hipcamp_url, vrbo_url
    ) VALUES (
      ${input.slug}, ${input.name}, ${input.shortDescription}, ${input.sortOrder}, ${input.listed},
      ${input.directBookingEnabled}, ${input.isWholeProperty}, ${input.basePriceCents},
      ${input.cleaningFeeCents}, ${input.maxGuests}, ${input.baseGuests},
      ${input.extraGuestFeeCents}, ${input.petsAllowed}, ${input.maxPets}, ${input.petFeeCents},
      ${input.minStay}, ${input.airbnbIcalUrl}, ${input.hipcampIcalUrl}, ${input.vrboIcalUrl},
      ${input.airbnbUrl}, ${input.hipcampUrl}, ${input.vrboUrl}
    )
    RETURNING id
  `;
  return String(rows[0].id);
}

const PLATFORM_LABEL = {
  airbnb: "Airbnb",
  hipcamp: "Hipcamp",
  vrbo: "VRBO",
} as const;
type Platform = keyof typeof PLATFORM_LABEL;
const icalField = {
  airbnb: "airbnbIcalUrl",
  hipcamp: "hipcampIcalUrl",
  vrbo: "vrboIcalUrl",
} as const satisfies Record<Platform, keyof UnitInput>;

export interface UpdateUnitOptions {
  /**
   * When a calendar link is removed: keep its upcoming imported dates as
   * owner blocks (true) or reopen them (false).
   */
  keepDisconnectedAsBlocks?: boolean;
}

export interface UpdateUnitResult {
  /** Platforms whose link was removed or replaced. */
  disconnected: Platform[];
  /** Platforms whose link is new or changed and should be imported now. */
  reconnected: Platform[];
}

/**
 * Active bookings of other stays that overlap this stay's active bookings.
 * Making this stay the whole property would make those pairs conflict.
 */
export async function wholePropertyConflicts(id: string) {
  const rows = await sql`
    SELECT a.check_in AS a_in, a.check_out AS a_out, b.unit_name AS other, b.check_in AS b_in, b.check_out AS b_out
      FROM bookings a
      JOIN bookings b
        ON b.unit_id <> a.unit_id
       AND daterange(a.check_in, a.check_out, '[)') && daterange(b.check_in, b.check_out, '[)')
     WHERE a.unit_id = ${id}
       AND a.booking_status IN ('pending_payment', 'requested', 'confirmed')
       AND b.booking_status IN ('pending_payment', 'requested', 'confirmed')
     ORDER BY a.check_in
     LIMIT 10
  `;
  return rows.map((r) => ({
    other: String(r.other),
    start: dbDate(r.b_in),
    end: dbDate(r.b_out),
  }));
}

/**
 * Save a stay. Runs as one transaction so derived data never goes stale:
 * - Changing the whole-property flag recomputes the inventory protection of
 *   this stay's existing bookings (the database rejects the save if that
 *   would make active bookings overlap).
 * - Removing or replacing a platform calendar link clears that platform's
 *   imported dates and sync status (optionally keeping upcoming dates as
 *   owner blocks), so they can't linger with nothing left to refresh them.
 */
export async function updateUnit(
  id: string,
  input: UnitInput,
  options: UpdateUnitOptions = {},
): Promise<UpdateUnitResult> {
  const current = await getUnitById(id);
  if (!current) throw new Error("Stay not found");

  const disconnected: Platform[] = [];
  const reconnected: Platform[] = [];
  for (const p of Object.keys(icalField) as Platform[]) {
    const before = current[icalField[p]];
    const after = input[icalField[p]];
    if (before && before !== after) disconnected.push(p);
    if (after && after !== before) reconnected.push(p);
  }

  const queries = [
    sql`
      UPDATE units SET
        slug = ${input.slug}, name = ${input.name}, short_description = ${input.shortDescription},
        sort_order = ${input.sortOrder}, listed = ${input.listed},
        direct_booking_enabled = ${input.directBookingEnabled},
        is_whole_property = ${input.isWholeProperty}, base_price_cents = ${input.basePriceCents},
        cleaning_fee_cents = ${input.cleaningFeeCents}, max_guests = ${input.maxGuests},
        base_guests = ${input.baseGuests}, extra_guest_fee_cents = ${input.extraGuestFeeCents},
        pets_allowed = ${input.petsAllowed}, max_pets = ${input.maxPets},
        pet_fee_cents = ${input.petFeeCents}, min_stay = ${input.minStay},
        airbnb_ical_url = ${input.airbnbIcalUrl}, hipcamp_ical_url = ${input.hipcampIcalUrl},
        vrbo_ical_url = ${input.vrboIcalUrl}, airbnb_url = ${input.airbnbUrl},
        hipcamp_url = ${input.hipcampUrl}, vrbo_url = ${input.vrboUrl}, updated_at = now()
      WHERE id = ${id}
    `,
  ];

  if (current.isWholeProperty !== input.isWholeProperty) {
    // Re-fires the inventory trigger for every booking of this stay.
    queries.push(
      sql`UPDATE bookings SET unit_id = unit_id WHERE unit_id = ${id}`,
    );
  }

  for (const p of disconnected) {
    const removed = !input[icalField[p]];
    if (removed && options.keepDisconnectedAsBlocks) {
      const note = `Kept from ${PLATFORM_LABEL[p]} when its calendar link was removed`;
      queries.push(sql`
        INSERT INTO calendar_blocks (unit_id, start_date, end_date, note)
        SELECT unit_id, check_in, check_out, ${note}
          FROM external_bookings
         WHERE unit_id = ${id} AND source = ${p} AND check_out > CURRENT_DATE
      `);
    }
    queries.push(
      sql`DELETE FROM external_bookings WHERE unit_id = ${id} AND source = ${p}`,
    );
    queries.push(
      sql`DELETE FROM calendar_sync_status WHERE unit_id = ${id} AND source = ${p}`,
    );
  }

  await sql.transaction(queries);
  return { disconnected, reconnected };
}

export async function addSeason(unitId: string, s: Omit<SeasonRecord, "id">) {
  await sql`
    INSERT INTO seasonal_rates (unit_id, name, start_date, end_date, price_cents)
    VALUES (${unitId}, ${s.name}, ${s.startDate}, ${s.endDate}, ${s.priceCents})
  `;
}

export async function updateSeason(
  unitId: string,
  seasonId: string,
  s: Omit<SeasonRecord, "id">,
) {
  await sql`
    UPDATE seasonal_rates
       SET name = ${s.name}, start_date = ${s.startDate}, end_date = ${s.endDate},
           price_cents = ${s.priceCents}
     WHERE id = ${seasonId} AND unit_id = ${unitId}
  `;
}

export async function deleteSeason(unitId: string, seasonId: string) {
  await sql`DELETE FROM seasonal_rates WHERE id = ${seasonId} AND unit_id = ${unitId}`;
}

export async function listTaxes(): Promise<TaxRecord[]> {
  const rows = await sql`SELECT * FROM tax_rates ORDER BY sort_order, name`;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    ratePercent: Number(r.rate_percent),
  }));
}

export async function addTax(name: string, ratePercent: number) {
  await sql`
    INSERT INTO tax_rates (name, rate_percent, sort_order)
    VALUES (${name}, ${ratePercent}, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM tax_rates))
  `;
}

export async function updateTax(id: string, name: string, ratePercent: number) {
  await sql`UPDATE tax_rates SET name = ${name}, rate_percent = ${ratePercent} WHERE id = ${id}`;
}

export async function deleteTax(id: string) {
  await sql`DELETE FROM tax_rates WHERE id = ${id}`;
}

export async function getSettings(): Promise<SettingsRecord> {
  const [r] = await sql`SELECT * FROM site_settings WHERE id = true`;
  return {
    cancellationPolicy: str(r?.cancellation_policy),
    houseRules: str(r?.house_rules),
    checkInTime: str(r?.check_in_time),
    checkOutTime: str(r?.check_out_time),
    requestResponseHours: r ? Number(r.request_response_hours) : 24,
  };
}

export async function saveSettings(s: SettingsRecord) {
  await sql`
    INSERT INTO site_settings (id, cancellation_policy, house_rules, check_in_time,
                               check_out_time, request_response_hours, updated_at)
    VALUES (true, ${s.cancellationPolicy}, ${s.houseRules}, ${s.checkInTime},
            ${s.checkOutTime}, ${s.requestResponseHours}, now())
    ON CONFLICT (id) DO UPDATE SET
      cancellation_policy = EXCLUDED.cancellation_policy,
      house_rules = EXCLUDED.house_rules,
      check_in_time = EXCLUDED.check_in_time,
      check_out_time = EXCLUDED.check_out_time,
      request_response_hours = EXCLUDED.request_response_hours,
      updated_at = now()
  `;
}
