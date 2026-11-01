// Server-only loaders for the booking engine. Reads Sanity without the CDN
// so prices, policies and calendar URLs are never stale at checkout.

import { createClient } from "next-sanity";
import type { PricingUnit, TaxRate } from "./pricing";

const fresh = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "unconfigured",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: "published",
});

export type CalendarSource = "airbnb" | "hipcamp" | "vrbo";
export const CALENDAR_SOURCES: CalendarSource[] = ["airbnb", "hipcamp", "vrbo"];

export interface BookableUnit extends PricingUnit {
  _id: string;
  name: string;
  slug: string;
  available: boolean;
  directBookingEnabled: boolean;
  icalUrls: Partial<Record<CalendarSource, string>>;
}

const UNIT_PROJECTION = `{
  _id, name, "slug": slug.current, available,
  basePrice, seasonalPricing, cleaningFee, baseGuests, extraGuestFee,
  petsAllowed, maxPets, petFee, minStay, maxGuests,
  "directBookingEnabled": coalesce(directBookingEnabled, true),
  airbnbIcalUrl, hipcampIcalUrl, vrboIcalUrl
}`;

interface RawUnit extends PricingUnit {
  _id: string;
  name: string;
  slug: string;
  available?: boolean;
  directBookingEnabled: boolean;
  airbnbIcalUrl?: string;
  hipcampIcalUrl?: string;
  vrboIcalUrl?: string;
}

function toBookable(u: RawUnit): BookableUnit {
  return {
    ...u,
    available: u.available !== false,
    icalUrls: {
      airbnb: u.airbnbIcalUrl || undefined,
      hipcamp: u.hipcampIcalUrl || undefined,
      vrbo: u.vrboIcalUrl || undefined,
    },
  };
}

export async function getBookableUnit(
  slug: string,
): Promise<BookableUnit | null> {
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET
  )
    throw new Error("Booking content is not configured.");
  const unit = await fresh.fetch<RawUnit | null>(
    `*[_type == "rentalUnit" && slug.current == $slug][0] ${UNIT_PROJECTION}`,
    { slug },
  );
  return unit ? toBookable(unit) : null;
}

export async function getBookableUnitById(
  id: string,
): Promise<BookableUnit | null> {
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET
  )
    throw new Error("Booking content is not configured.");
  const unit = await fresh.fetch<RawUnit | null>(
    `*[_type == "rentalUnit" && _id == $id][0] ${UNIT_PROJECTION}`,
    { id },
  );
  return unit ? toBookable(unit) : null;
}

export async function getAllBookableUnits(): Promise<BookableUnit[]> {
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET
  )
    throw new Error("Booking content is not configured.");
  const units = await fresh.fetch<RawUnit[]>(
    `*[_type == "rentalUnit"] | order(sortOrder asc, name asc) ${UNIT_PROJECTION}`,
  );
  return units.map(toBookable);
}

export interface BookingSettings {
  taxRates: TaxRate[];
  cancellationPolicy: string | null;
  houseRules: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  requestResponseHours: number;
  email: string | null;
  phone: string | null;
}

export async function getBookingSettings(): Promise<BookingSettings> {
  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.NEXT_PUBLIC_SANITY_DATASET
  )
    throw new Error("Booking content is not configured.");
  const s = await fresh.fetch<Partial<BookingSettings> | null>(
    `*[_type == "siteSettings"][0] {
      "taxRates": taxRates[]{ name, ratePercent },
      cancellationPolicy, houseRules, checkInTime, checkOutTime,
      requestResponseHours, email, phone
    }`,
  );
  return {
    taxRates: (s?.taxRates ?? []).filter((t) => t?.name && t.ratePercent > 0),
    cancellationPolicy: s?.cancellationPolicy ?? null,
    houseRules: s?.houseRules ?? null,
    checkInTime: s?.checkInTime ?? null,
    checkOutTime: s?.checkOutTime ?? null,
    requestResponseHours: Math.min(
      144,
      s?.requestResponseHours && s.requestResponseHours > 0
        ? s.requestResponseHours
        : 24,
    ),
    email: s?.email ?? null,
    phone: s?.phone ?? null,
  };
}
