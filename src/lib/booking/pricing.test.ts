import { describe, expect, it } from 'vitest';
import { quoteStay, rateForNight, type PricingUnit } from './pricing';
import { eachNight, isIsoDate, nightsBetween, rangesOverlap, todayAtProperty } from './dates';

const unit: PricingUnit = {
  basePrice: 150,
  cleaningFee: 75,
  baseGuests: 2,
  extraGuestFee: 20,
  petsAllowed: true,
  maxPets: 2,
  petFee: 50,
  minStay: 2,
  maxGuests: 4,
  seasonalPricing: [
    { season: 'Fall color', startDate: '2026-10-01', endDate: '2026-10-31', pricePerNight: 200 },
    { season: 'Halloween', startDate: '2026-10-30', endDate: '2026-10-31', pricePerNight: 250 },
  ],
};
const TODAY = '2026-09-01';
const quote = (req: Partial<Parameters<typeof quoteStay>[1]>, taxes = [] as { name: string; ratePercent: number }[]) =>
  quoteStay(unit, { checkIn: '2026-09-10', checkOut: '2026-09-12', guests: 2, pets: 0, ...req }, taxes, TODAY);

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
  });
  it('counts nights across DST and month ends', () => {
    expect(nightsBetween('2026-11-01', '2026-11-03')).toBe(2); // DST ends Nov 1
    expect(eachNight('2026-10-31', '2026-11-02')).toEqual(['2026-10-31', '2026-11-01']);
  });
  it('treats back-to-back stays as not overlapping', () => {
    expect(rangesOverlap('2026-09-10', '2026-09-12', '2026-09-12', '2026-09-14')).toBe(false);
    expect(rangesOverlap('2026-09-10', '2026-09-13', '2026-09-12', '2026-09-14')).toBe(true);
  });
  it('evaluates today in Central time', () => {
    // 03:00 UTC on Nov 1 is still Oct 31 in Missouri.
    expect(todayAtProperty(new Date('2026-11-01T03:00:00Z'))).toBe('2026-10-31');
  });
});

describe('quoteStay', () => {
  it('prices a basic stay in cents', () => {
    const r = quote({});
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.numNights).toBe(2);
    expect(r.quote.lodgingCents).toBe(30000);
    expect(r.quote.cleaningCents).toBe(7500);
    expect(r.quote.totalCents).toBe(37500);
  });

  it('applies the most specific season per night', () => {
    expect(rateForNight(unit, '2026-10-15').rateCents).toBe(20000);
    expect(rateForNight(unit, '2026-10-30').rateCents).toBe(25000);
    expect(rateForNight(unit, '2026-11-01').rateCents).toBe(15000);
    const r = quote({ checkIn: '2026-10-29', checkOut: '2026-11-01' });
    expect(r.ok && r.quote.lodgingCents).toBe(20000 + 25000 + 25000);
  });

  it('charges extra guests per night and pets once', () => {
    const r = quote({ guests: 4, pets: 1 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.extraGuestCents).toBe(2 * 2000 * 2);
    expect(r.quote.petCents).toBe(5000);
  });

  it('adds each tax on the full subtotal', () => {
    const r = quote({}, [
      { name: 'State sales tax', ratePercent: 4.225 },
      { name: 'Lodging tax', ratePercent: 5 },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.taxes.map((t) => t.amountCents)).toEqual([1584, 1875]);
    expect(r.quote.totalCents).toBe(37500 + 1584 + 1875);
  });

  it.each([
    [{ checkIn: '2026-09-12', checkOut: '2026-09-12' }, 'invalid_dates'],
    [{ checkIn: '2026-08-30', checkOut: '2026-09-02' }, 'past_dates'],
    [{ checkIn: '2026-09-10', checkOut: '2026-09-11' }, 'min_stay'],
    [{ guests: 5 }, 'too_many_guests'],
    [{ guests: 0 }, 'invalid_guests'],
    [{ pets: 3 }, 'too_many_pets'],
    [{ checkIn: '2028-06-01', checkOut: '2028-06-03' }, 'too_far_ahead'],
  ])('rejects %j with %s', (req, code) => {
    const r = quote(req);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe(code);
  });

  it('rejects pets where not allowed and unpriced units', () => {
    const noPets = quoteStay({ ...unit, petsAllowed: false }, { checkIn: '2026-09-10', checkOut: '2026-09-12', guests: 1, pets: 1 }, [], TODAY);
    expect(!noPets.ok && noPets.code).toBe('pets_not_allowed');
    const unpriced = quoteStay({ ...unit, basePrice: 0 }, { checkIn: '2026-09-10', checkOut: '2026-09-12', guests: 1, pets: 0 }, [], TODAY);
    expect(!unpriced.ok && unpriced.code).toBe('unit_not_priced');
  });
});
