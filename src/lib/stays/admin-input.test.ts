import { describe, expect, it } from 'vitest';
import { parseSeasonForm, parseSettingsForm, parseTaxForm, parseUnitForm } from './admin-input';

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

const base = {
  name: 'Cozy Cottage',
  slug: 'cozy-cottage',
  shortDescription: '',
  sortOrder: '10',
  listed: 'on',
  basePriceCents: '$150',
  cleaningFeeCents: '75.00',
  maxGuests: '4',
  baseGuests: '2',
  extraGuestFeeCents: '20',
  maxPets: '2',
  petFeeCents: '50',
  minStay: '2',
  airbnbIcalUrl: 'https://www.airbnb.com/calendar/ical/1.ics?s=abc',
  hipcampIcalUrl: '',
  vrboIcalUrl: '',
  airbnbUrl: '',
  hipcampUrl: '',
  vrboUrl: '',
};

describe('stay form', () => {
  it('converts dollars to cents and unchecked boxes to false', () => {
    const r = parseUnitForm(form(base));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toMatchObject({
      basePriceCents: 15000,
      cleaningFeeCents: 7500,
      extraGuestFeeCents: 2000,
      listed: true,
      directBookingEnabled: false,
      petsAllowed: false,
      // Pet settings are cleared when pets are not allowed.
      maxPets: 0,
      petFeeCents: 0,
      shortDescription: null,
      hipcampIcalUrl: null,
    });
  });

  it.each([
    [{ directBookingEnabled: 'on', basePriceCents: '' }, /nightly price before/],
    [{ basePriceCents: '15o' }, /Nightly price/],
    [{ baseGuests: '6' }, /cannot exceed/],
    [{ slug: 'Cozy Cottage' }, /Web address/],
    [{ airbnbIcalUrl: 'http://insecure.example/cal.ics' }, /https/],
    [{ minStay: '0' }, /Minimum nights/],
  ])('rejects %j', (override, message) => {
    const r = parseUnitForm(form({ ...base, ...override }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(message);
  });
});

describe('season, tax and settings forms', () => {
  it('validates seasons', () => {
    expect(parseSeasonForm(form({ name: 'Fall', startDate: '2027-10-01', endDate: '2027-10-31', price: '200' }))).toEqual({
      ok: true,
      value: { name: 'Fall', startDate: '2027-10-01', endDate: '2027-10-31', priceCents: 20000 },
    });
    expect(parseSeasonForm(form({ name: 'Fall', startDate: '2027-10-31', endDate: '2027-10-01', price: '200' })).ok).toBe(false);
  });

  it('validates taxes', () => {
    expect(parseTaxForm(form({ name: 'State sales tax', ratePercent: '4.225' }))).toEqual({
      ok: true,
      value: { name: 'State sales tax', ratePercent: 4.225 },
    });
    expect(parseTaxForm(form({ name: 'Too much', ratePercent: '45' })).ok).toBe(false);
  });

  it('caps the response window at the card-hold limit', () => {
    expect(parseSettingsForm(form({ requestResponseHours: '200' })).ok).toBe(false);
    const r = parseSettingsForm(form({ requestResponseHours: '24', checkInTime: '3:00 PM' }));
    expect(r).toMatchObject({ ok: true, value: { requestResponseHours: 24, checkInTime: '3:00 PM', houseRules: null } });
  });
});
