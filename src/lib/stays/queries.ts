// Stays for public pages: business fields from Postgres (/admin) merged with
// descriptive content from src/lib/content/property.ts.
//
// If the database is unreachable or not configured, pages still render from
// the published content, with no prices and online requests off. Checkout
// itself always reads the database directly (src/lib/booking/units.ts).

import { listUnits, type UnitRecord } from "./repository";
import type { RentalUnit, Review } from "./types";
import { publishedUnits, stayDetails } from "@/lib/content/property";

const dollars = (cents: number) => cents / 100;

function toDisplay(u: UnitRecord): RentalUnit {
  const content = stayDetails(u.slug);
  const fallback = publishedUnits.find((p) => p.slug.current === u.slug);
  return {
    _id: u.id,
    name: u.name,
    slug: { _type: "slug", current: u.slug },
    shortDescription: u.shortDescription || content?.description,
    basePrice: dollars(u.basePriceCents),
    seasonalPricing: u.seasons.map((s) => ({
      season: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      pricePerNight: dollars(s.priceCents),
    })),
    cleaningFee: dollars(u.cleaningFeeCents),
    baseGuests: u.baseGuests ?? undefined,
    extraGuestFee: dollars(u.extraGuestFeeCents),
    petsAllowed: u.petsAllowed,
    maxPets: u.maxPets,
    petFee: dollars(u.petFeeCents),
    minStay: u.minStay,
    maxGuests: u.maxGuests,
    bedrooms: 1,
    bathrooms: 1,
    beds: fallback?.beds,
    amenities: fallback?.amenities,
    airbnbUrl: u.airbnbUrl ?? undefined,
    hipcampUrl: u.hipcampUrl ?? undefined,
    vrboUrl: u.vrboUrl ?? undefined,
    directBookingEnabled: u.directBookingEnabled && u.basePriceCents > 0,
    isWholeProperty: u.isWholeProperty,
    available: u.listed,
    sortOrder: u.sortOrder,
  };
}

async function loadUnits(): Promise<RentalUnit[]> {
  if (!process.env.DATABASE_URL) return publishedUnits;
  try {
    return (await listUnits()).map(toDisplay);
  } catch (error) {
    console.error(
      "Stays unavailable; showing published content",
      error instanceof Error ? error.message : error,
    );
    return publishedUnits;
  }
}

/** Stays shown on the website, in admin sort order. */
export async function getAllUnits(): Promise<RentalUnit[]> {
  return (await loadUnits()).filter((u) => u.available);
}

export async function getUnitBySlug(slug: string): Promise<RentalUnit | null> {
  return (await getAllUnits()).find((u) => u.slug.current === slug) ?? null;
}

/** Curated guest reviews. None are published yet; the page links to Airbnb. */
export async function getReviews(): Promise<Review[]> {
  return [];
}
