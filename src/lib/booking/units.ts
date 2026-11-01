// Booking-engine view of stays and settings, read fresh from Postgres on
// every call so prices, policies and calendar links are never stale.

import type { PricingUnit, TaxRate } from './pricing';
import {
  getSettings,
  getUnitById,
  getUnitBySlug,
  listTaxes,
  listUnits,
  type UnitRecord,
} from '@/lib/stays/repository';

export type CalendarSource = 'airbnb' | 'hipcamp' | 'vrbo';
export const CALENDAR_SOURCES: CalendarSource[] = ['airbnb', 'hipcamp', 'vrbo'];

export interface BookableUnit extends PricingUnit {
  _id: string;
  name: string;
  slug: string;
  available: boolean;
  directBookingEnabled: boolean;
  isWholeProperty: boolean;
  icalUrls: Partial<Record<CalendarSource, string>>;
}

const dollars = (cents: number) => cents / 100;

export function toBookable(u: UnitRecord): BookableUnit {
  return {
    _id: u.id,
    name: u.name,
    slug: u.slug,
    available: u.listed,
    directBookingEnabled: u.directBookingEnabled && u.basePriceCents > 0,
    isWholeProperty: u.isWholeProperty,
    basePrice: dollars(u.basePriceCents),
    seasonalPricing: u.seasons.map((s) => ({
      season: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      pricePerNight: dollars(s.priceCents),
    })),
    cleaningFee: dollars(u.cleaningFeeCents),
    baseGuests: u.baseGuests,
    extraGuestFee: dollars(u.extraGuestFeeCents),
    petsAllowed: u.petsAllowed,
    maxPets: u.maxPets,
    petFee: dollars(u.petFeeCents),
    minStay: u.minStay,
    maxGuests: u.maxGuests,
    icalUrls: {
      airbnb: u.airbnbIcalUrl || undefined,
      hipcamp: u.hipcampIcalUrl || undefined,
      vrbo: u.vrboIcalUrl || undefined,
    },
  };
}

export async function getBookableUnit(slug: string): Promise<BookableUnit | null> {
  const unit = await getUnitBySlug(slug);
  return unit ? toBookable(unit) : null;
}

export async function getBookableUnitById(id: string): Promise<BookableUnit | null> {
  const unit = await getUnitById(id);
  return unit ? toBookable(unit) : null;
}

export async function getAllBookableUnits(): Promise<BookableUnit[]> {
  return (await listUnits()).map(toBookable);
}

export interface BookingSettings {
  taxRates: TaxRate[];
  cancellationPolicy: string | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  requestResponseHours: number;
}

export async function getBookingSettings(): Promise<BookingSettings> {
  const [settings, taxes] = await Promise.all([getSettings(), listTaxes()]);
  return {
    ...settings,
    taxRates: taxes.map((t) => ({ name: t.name, ratePercent: t.ratePercent })),
    requestResponseHours: Math.min(144, Math.max(1, settings.requestResponseHours)),
  };
}
