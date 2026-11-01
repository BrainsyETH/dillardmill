import { beforeAll, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/pglite-sql";

const state = vi.hoisted(() => ({ sql: null as unknown }));
vi.mock("@/lib/db/client", () => ({
  get sql() {
    return state.sql;
  },
}));

const repo = await import("./repository");
const { getBookableUnit, getBookingSettings } =
  await import("@/lib/booking/units");
const { quoteStay } = await import("@/lib/booking/pricing");

beforeAll(async () => {
  state.sql = (await createTestDb()).sql;
});

describe("property data in Postgres", () => {
  it("seeds the published stays with online requests off and no price", async () => {
    const units = await repo.listUnits();
    expect(units.map((u) => u.slug)).toEqual([
      "cozy-cottage",
      "original-airstream",
      "the-sebastian",
      "book-the-farm",
    ]);
    expect(
      units.every((u) => !u.directBookingEnabled && u.basePriceCents === 0),
    ).toBe(true);
    expect(units.filter((u) => u.isWholeProperty).map((u) => u.slug)).toEqual([
      "book-the-farm",
    ]);
  });

  it("round-trips a priced stay into the booking engine in dollars", async () => {
    const cottage = (await repo.getUnitBySlug("cozy-cottage"))!;
    await repo.updateUnit(cottage.id, {
      ...cottage,
      basePriceCents: 15000,
      cleaningFeeCents: 7500,
      baseGuests: 2,
      extraGuestFeeCents: 2000,
      petFeeCents: 5000,
      minStay: 2,
      directBookingEnabled: true,
      airbnbIcalUrl: "https://www.airbnb.com/calendar/ical/1.ics",
    });
    await repo.addSeason(cottage.id, {
      name: "Fall color",
      startDate: "2027-10-01",
      endDate: "2027-10-31",
      priceCents: 20000,
    });
    await repo.addTax("Lodging tax", 5);
    await repo.saveSettings({
      cancellationPolicy: "Full refund up to 14 days before arrival.",
      houseRules: null,
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      requestResponseHours: 36,
    });

    const unit = (await getBookableUnit("cozy-cottage"))!;
    expect(unit).toMatchObject({
      basePrice: 150,
      cleaningFee: 75,
      directBookingEnabled: true,
      isWholeProperty: false,
      icalUrls: { airbnb: "https://www.airbnb.com/calendar/ical/1.ics" },
    });
    const settings = await getBookingSettings();
    expect(settings).toMatchObject({
      requestResponseHours: 36,
      taxRates: [{ name: "Lodging tax", ratePercent: 5 }],
    });

    const q = quoteStay(
      unit,
      { checkIn: "2027-10-30", checkOut: "2027-11-02", guests: 3, pets: 1 },
      settings.taxRates,
      "2027-01-01",
    );
    expect(q.ok).toBe(true);
    if (q.ok) {
      // 2 fall nights at $200 + 1 at $150, +1 guest × $20 × 3, $50 pet, $75 cleaning, 5% tax
      expect(q.quote.subtotalCents).toBe(55000 + 6000 + 5000 + 7500);
      expect(q.quote.totalCents).toBe(73500 + 3675);
    }
  });

  it("rejects data that would break checkout", async () => {
    const seb = (await repo.getUnitBySlug("the-sebastian"))!;
    // Online requests need a price.
    await expect(
      repo.updateUnit(seb.id, {
        ...seb,
        directBookingEnabled: true,
        basePriceCents: 0,
      }),
    ).rejects.toThrow();
    // Only one whole-property listing.
    await expect(
      repo.updateUnit(seb.id, { ...seb, isWholeProperty: true }),
    ).rejects.toThrow();
    // Season must end on or after it starts.
    await expect(
      repo.addSeason(seb.id, {
        name: "Bad",
        startDate: "2027-05-10",
        endDate: "2027-05-01",
        priceCents: 100,
      }),
    ).rejects.toThrow();
    // Slugs are URL-safe.
    await expect(
      repo.updateUnit(seb.id, { ...seb, slug: "The Sebastian!" }),
    ).rejects.toThrow();
  });
});

describe("saving a stay keeps derived data consistent", () => {
  const insertBooking = (
    unitId: string,
    slug: string,
    checkIn: string,
    checkOut: string,
    code: string,
  ) =>
    (state.sql as (
      s: TemplateStringsArray,
      ...v: unknown[]
    ) => Promise<unknown>)`
      INSERT INTO bookings (guest_name, guest_email, unit_id, unit_slug, unit_name, check_in, check_out,
        num_guests, num_nights, base_price, cleaning_fee, total_amount, booking_status, confirmation_code)
      VALUES ('Guest', 'g@example.com', ${unitId}, ${slug}, ${slug}, ${checkIn}, ${checkOut},
        2, 2, 1, 1, 1, 'confirmed', ${code})`;
  const q = (s: TemplateStringsArray, ...v: unknown[]) =>
    (
      state.sql as (
        s: TemplateStringsArray,
        ...v: unknown[]
      ) => Promise<Record<string, unknown>[]>
    )(s, ...v);

  it("clears a disconnected calendar's imported dates and sync status", async () => {
    const airstream = (await repo.getUnitBySlug("original-airstream"))!;
    await repo.updateUnit(airstream.id, {
      ...airstream,
      airbnbIcalUrl: "https://www.airbnb.com/calendar/ical/9.ics",
    });
    await q`INSERT INTO external_bookings (unit_id, check_in, check_out, source, kind)
            VALUES (${airstream.id}, '2099-01-10', '2099-01-12', 'airbnb', 'reservation')`;
    await q`INSERT INTO calendar_sync_status (unit_id, source, last_success_at) VALUES (${airstream.id}, 'airbnb', now())`;

    const saved = (await repo.getUnitById(airstream.id))!;
    const r = await repo.updateUnit(airstream.id, {
      ...saved,
      airbnbIcalUrl: null,
    });
    expect(r.disconnected).toEqual(["airbnb"]);
    expect(
      await q`SELECT * FROM external_bookings WHERE unit_id = ${airstream.id}`,
    ).toHaveLength(0);
    expect(
      await q`SELECT * FROM calendar_sync_status WHERE unit_id = ${airstream.id}`,
    ).toHaveLength(0);
    expect(
      await q`SELECT * FROM calendar_blocks WHERE unit_id = ${airstream.id}`,
    ).toHaveLength(0);
  });

  it("can keep a disconnected calendar's upcoming dates as owner blocks", async () => {
    const airstream = (await repo.getUnitBySlug("original-airstream"))!;
    await repo.updateUnit(airstream.id, {
      ...airstream,
      airbnbIcalUrl: "https://www.airbnb.com/calendar/ical/9.ics",
    });
    await q`INSERT INTO external_bookings (unit_id, check_in, check_out, source, kind) VALUES
            (${airstream.id}, '2099-02-10', '2099-02-12', 'airbnb', 'reservation'),
            (${airstream.id}, '2000-02-10', '2000-02-12', 'airbnb', 'reservation')`;
    const saved = (await repo.getUnitById(airstream.id))!;
    await repo.updateUnit(
      airstream.id,
      { ...saved, airbnbIcalUrl: null },
      { keepDisconnectedAsBlocks: true },
    );
    const blocks =
      await q`SELECT start_date::text AS s, note FROM calendar_blocks WHERE unit_id = ${airstream.id}`;
    expect(blocks).toEqual([
      {
        s: "2099-02-10",
        note: "Kept from Airbnb when its calendar link was removed",
      },
    ]);
    expect(
      await q`SELECT * FROM external_bookings WHERE unit_id = ${airstream.id}`,
    ).toHaveLength(0);
  });

  it("refuses to make a stay the whole property while its bookings overlap other stays'", async () => {
    await q`DELETE FROM bookings`;
    const farm = (await repo.getUnitBySlug("book-the-farm"))!;
    await repo.updateUnit(farm.id, { ...farm, isWholeProperty: false });
    const seb = (await repo.getUnitBySlug("the-sebastian"))!;
    await insertBooking(
      seb.id,
      seb.slug,
      "2099-03-10",
      "2099-03-12",
      "PV-SEB00001",
    );
    await insertBooking(
      "cozy-cottage",
      "cozy-cottage",
      "2099-03-11",
      "2099-03-13",
      "PV-COT00001",
    );

    expect(await repo.wholePropertyConflicts(seb.id)).toEqual([
      { other: "cozy-cottage", start: "2099-03-11", end: "2099-03-13" },
    ]);
    await expect(
      repo.updateUnit(seb.id, { ...seb, isWholeProperty: true }),
    ).rejects.toThrow();
    expect((await repo.getUnitById(seb.id))!.isWholeProperty).toBe(false);
  });

  it("protects existing bookings immediately when a stay becomes the whole property", async () => {
    await q`DELETE FROM bookings`;
    const seb = (await repo.getUnitBySlug("the-sebastian"))!;
    await insertBooking(
      seb.id,
      seb.slug,
      "2099-04-10",
      "2099-04-12",
      "PV-SEB00002",
    );
    await repo.updateUnit(seb.id, { ...seb, isWholeProperty: true });
    // Another stay can no longer take those nights.
    await expect(
      insertBooking(
        "cozy-cottage",
        "cozy-cottage",
        "2099-04-11",
        "2099-04-13",
        "PV-COT00002",
      ),
    ).rejects.toThrow();
    // And switching back releases them.
    const now = (await repo.getUnitById(seb.id))!;
    await repo.updateUnit(seb.id, { ...now, isWholeProperty: false });
    await expect(
      insertBooking(
        "cozy-cottage",
        "cozy-cottage",
        "2099-04-11",
        "2099-04-13",
        "PV-COT00003",
      ),
    ).resolves.toBeDefined();
  });
});
