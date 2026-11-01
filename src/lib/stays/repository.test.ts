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
