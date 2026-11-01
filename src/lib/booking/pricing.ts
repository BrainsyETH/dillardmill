// Server-side price quote for a direct booking.
//
// This is the only place a booking total is computed. The browser displays
// what this returns; the request endpoint recomputes it and authorizes the
// card for exactly this amount. All money is integer cents.

import { eachNight, isIsoDate, nightsBetween } from './dates';

export const MAX_NIGHTS = 60;
export const MAX_ADVANCE_DAYS = 548; // ~18 months

export interface SeasonalRate {
  season: string;
  startDate: string; // inclusive
  endDate: string; // inclusive
  pricePerNight: number; // dollars
}

export interface PricingUnit {
  basePrice: number; // dollars per night
  seasonalPricing?: SeasonalRate[] | null;
  cleaningFee?: number | null;
  baseGuests?: number | null;
  extraGuestFee?: number | null; // dollars per extra guest per night
  petsAllowed?: boolean | null;
  maxPets?: number | null;
  petFee?: number | null; // dollars per pet, once per stay
  minStay?: number | null;
  maxGuests: number;
}

export interface TaxRate {
  name: string;
  ratePercent: number;
}

export interface QuoteRequest {
  checkIn: string;
  checkOut: string;
  guests: number;
  pets: number;
}

export interface NightlyLine {
  date: string;
  rateCents: number;
  season?: string;
}

export interface Quote {
  checkIn: string;
  checkOut: string;
  numNights: number;
  guests: number;
  pets: number;
  nights: NightlyLine[];
  lodgingCents: number;
  extraGuestCents: number;
  extraGuests: number;
  petCents: number;
  cleaningCents: number;
  subtotalCents: number;
  taxes: { name: string; ratePercent: number; amountCents: number }[];
  taxCents: number;
  totalCents: number;
}

export type QuoteErrorCode =
  | 'invalid_dates'
  | 'past_dates'
  | 'too_far_ahead'
  | 'min_stay'
  | 'max_stay'
  | 'invalid_guests'
  | 'too_many_guests'
  | 'pets_not_allowed'
  | 'too_many_pets'
  | 'unit_not_priced';

export type QuoteResult =
  | { ok: true; quote: Quote }
  | { ok: false; code: QuoteErrorCode; error: string };

const cents = (dollars: number | null | undefined) =>
  Math.round((dollars ?? 0) * 100);

function fail(code: QuoteErrorCode, error: string): QuoteResult {
  return { ok: false, code, error };
}

/** Nightly rate for a date: the matching season with the latest start wins. */
export function rateForNight(
  unit: Pick<PricingUnit, 'basePrice' | 'seasonalPricing'>,
  date: string,
): NightlyLine {
  const seasons = (unit.seasonalPricing ?? [])
    .filter(
      (s) =>
        isIsoDate(s.startDate) &&
        isIsoDate(s.endDate) &&
        s.startDate <= date &&
        date <= s.endDate &&
        s.pricePerNight > 0,
    )
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
  const season = seasons[0];
  if (season) {
    return { date, rateCents: cents(season.pricePerNight), season: season.season };
  }
  return { date, rateCents: cents(unit.basePrice) };
}

export function quoteStay(
  unit: PricingUnit,
  request: QuoteRequest,
  taxRates: TaxRate[],
  today: string,
): QuoteResult {
  const { checkIn, checkOut } = request;
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut <= checkIn) {
    return fail('invalid_dates', 'Choose a check-in date before the check-out date.');
  }
  if (checkIn < today) {
    return fail('past_dates', 'Check-in cannot be in the past.');
  }
  if (nightsBetween(today, checkIn) > MAX_ADVANCE_DAYS) {
    return fail('too_far_ahead', 'Those dates are not open for booking yet.');
  }

  const numNights = nightsBetween(checkIn, checkOut);
  const minStay = Math.max(1, unit.minStay ?? 1);
  if (numNights < minStay) {
    return fail('min_stay', `This stay requires at least ${minStay} nights.`);
  }
  if (numNights > MAX_NIGHTS) {
    return fail('max_stay', `Stays longer than ${MAX_NIGHTS} nights need to be arranged directly.`);
  }

  const guests = request.guests;
  if (!Number.isInteger(guests) || guests < 1) {
    return fail('invalid_guests', 'At least one guest is required.');
  }
  if (guests > unit.maxGuests) {
    return fail('too_many_guests', `This stay sleeps up to ${unit.maxGuests} guests.`);
  }

  const pets = request.pets;
  if (!Number.isInteger(pets) || pets < 0) {
    return fail('too_many_pets', 'Enter a valid number of pets.');
  }
  if (pets > 0 && !unit.petsAllowed) {
    return fail('pets_not_allowed', 'Pets are not allowed at this stay.');
  }
  if (unit.petsAllowed && unit.maxPets != null && pets > unit.maxPets) {
    return fail('too_many_pets', `Up to ${unit.maxPets} pets are allowed.`);
  }

  if (!(unit.basePrice > 0)) {
    return fail('unit_not_priced', 'Online booking is not available for this stay yet.');
  }

  const nights = eachNight(checkIn, checkOut).map((d) => rateForNight(unit, d));
  const lodgingCents = nights.reduce((sum, n) => sum + n.rateCents, 0);

  const baseGuests = unit.baseGuests ?? unit.maxGuests;
  const extraGuests = Math.max(0, guests - baseGuests);
  const extraGuestCents = extraGuests * cents(unit.extraGuestFee) * numNights;
  const petCents = unit.petsAllowed ? pets * cents(unit.petFee) : 0;
  const cleaningCents = cents(unit.cleaningFee);

  const subtotalCents = lodgingCents + extraGuestCents + petCents + cleaningCents;
  const taxes = taxRates
    .filter((t) => t.ratePercent > 0)
    .map((t) => ({
      name: t.name,
      ratePercent: t.ratePercent,
      amountCents: Math.round((subtotalCents * t.ratePercent) / 100),
    }));
  const taxCents = taxes.reduce((sum, t) => sum + t.amountCents, 0);

  return {
    ok: true,
    quote: {
      checkIn,
      checkOut,
      numNights,
      guests,
      pets,
      nights,
      lodgingCents,
      extraGuestCents,
      extraGuests,
      petCents,
      cleaningCents,
      subtotalCents,
      taxes,
      taxCents,
      totalCents: subtotalCents + taxCents,
    },
  };
}

export function formatCents(amount: number): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
