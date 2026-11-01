import photos from "./photos.json";
import type { RentalUnit } from "@/lib/stays/types";

export interface PropertyPhoto {
  src: string;
  alt: string;
  caption: string;
  group?: string;
  unitSlug?: string;
}
const detail = {
  "cozy-cottage": {
    name: "Cozy Cottage",
    page: "cozycottage",
    lead: "ffcdbcdf6dd6",
    maxGuests: 4,
    beds: [
      { type: "full", count: 1 },
      { type: "futon", count: 1 },
    ],
    bath: "Private indoor bathroom",
    description:
      "A full kitchen, a living room to settle into, and a private patio. The cottage adjoins the main house, with a breezeway separating the two.",
    amenities: [
      "Full kitchen",
      "Washer and dryer",
      "Indoor shower",
      "Private patio",
    ],
  },
  "original-airstream": {
    name: "The Original Airstream",
    page: "airstream",
    lead: "7f2afc5d5364",
    maxGuests: 2,
    beds: [{ type: "queen", count: 1 }],
    bath: "Indoor toilet · outdoor bathing",
    description:
      "A vintage Airstream with a queen bed and its own deck. Soak in the outdoor clawfoot tub; inside, you have a kitchenette, toilet, and sink.",
    amenities: [
      "Queen bed",
      "Kitchenette",
      "Outdoor tub and shower",
      "Private deck",
    ],
  },
  "the-sebastian": {
    name: "The Sebastian",
    page: "sebastian",
    lead: "17a027c53e9c",
    maxGuests: 4,
    beds: [
      { type: "queen", count: 1 },
      { type: "twin", count: 2 },
    ],
    bath: "Indoor toilet · outdoor bathing",
    description:
      "A 1970 Avion with a queen bed, two twins, and two outdoor clawfoot tubs. There is a kitchenette inside, a deck outside, and plenty of the original personality.",
    amenities: [
      "Queen and two twin beds",
      "Kitchenette",
      "Two outdoor tubs",
      "Private deck",
    ],
  },
  "book-the-farm": {
    name: "Book the Farm",
    page: "book-the-farm",
    lead: "819922e5ba54",
    maxGuests: 50,
    beds: [],
    bath: "Private and shared bathrooms",
    description:
      "Bring your people to Pine Valley. Eight stays, shared places to eat and gather, and room for camping make the Farm a place for reunions and weekends together.",
    amenities: [
      "Eight accommodations",
      "Communal kitchen",
      "Courtyard",
      "Creek access",
    ],
  },
} as const;
export type KnownSlug = keyof typeof detail;
export function stayDetails(slug: string) {
  return detail[slug as KnownSlug];
}
export function photo(id: string): PropertyPhoto {
  const found = photos.find((p) => p.src.includes(id));
  if (!found) throw new Error(`Unknown property photo: ${id}`);
  return {
    src: found.src,
    alt: found.alt || "Pine Valley at Dillard Mill",
    caption: found.caption || "",
  };
}
export const propertyPhotos: PropertyPhoto[] = photos
  .filter((p) => p.sourcePages.includes("photos"))
  .map((p) => ({
    src: p.src,
    alt: p.alt,
    caption: p.caption,
    group: p.groups.find((g) => g !== "The grounds") || "The grounds",
    unitSlug: p.sourcePages.includes("cozycottage")
      ? "cozy-cottage"
      : p.sourcePages.includes("airstream")
        ? "original-airstream"
        : p.sourcePages.includes("sebastian")
          ? "the-sebastian"
          : undefined,
  }));
export function unitPhotos(unit: RentalUnit): PropertyPhoto[] {
  const d = stayDetails(unit.slug.current);
  if (!d) return [];
  const list = photos.filter((p) => p.sourcePages.includes(d.page));
  const lead = photos.find((p) => p.src.includes(d.lead));
  return [...(lead ? [lead] : []), ...list.filter((p) => p !== lead)].map(
    (p) => ({
      src: p.src,
      alt: /^Slide|^IMG_|^DSC|^Image/i.test(p.alt)
        ? `${unit.name} at Pine Valley`
        : p.alt || unit.name,
      caption: /^Slide|^IMG_|^DSC|^Image/i.test(p.caption) ? "" : p.caption,
      unitSlug: unit.slug.current,
    }),
  );
}
export function sleepingArrangement(unit: RentalUnit): string {
  const beds = unit.beds?.length
    ? unit.beds
    : stayDetails(unit.slug.current)?.beds;
  return beds?.length
    ? beds
        .map((b) => `${b.count} ${b.type}${b.count > 1 ? "s" : ""}`)
        .join(" · ")
    : `${unit.bedrooms || 1} bedroom${unit.bedrooms > 1 ? "s" : ""}`;
}
// Published property content, for display when the database is unavailable.
// These records never enable checkout or supply a price to the booking engine.
export const publishedUnits: RentalUnit[] = Object.entries(detail).map(
  ([slug, d]) => ({
    _id: `published-${slug}`,
    name: d.name,
    slug: { _type: "slug", current: slug },
    shortDescription: d.description,
    maxGuests: d.maxGuests,
    bedrooms: 1,
    bathrooms: 1,
    beds: d.beds.map((b) => ({ ...b })),
    basePrice: 0,
    directBookingEnabled: false,
    isWholeProperty: slug === "book-the-farm",
    available: true,
    amenities: d.amenities.map((name, i) => ({
      _id: `${slug}-${i}`,
      name,
      icon: "",
      category: "Essentials",
    })),
  }),
);
