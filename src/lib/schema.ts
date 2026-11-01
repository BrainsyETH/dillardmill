import type { RentalUnit } from "./stays/types";
import { getUnitUrl } from "./utils/slugToUrl";
import { unitPhotos } from "./content/property";

/**
 * Common address information for Pine Valley at Dillard Mill
 */
const PINE_VALLEY_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "126 Dillard Mill Road",
  addressLocality: "Davisville",
  addressRegion: "MO",
  postalCode: "65456",
  addressCountry: "US",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com";
const PHONE = "(314) 843-4321";
const BRAND_NAME = "Pine Valley at Dillard Mill";

/**
 * Generates LodgingBusiness schema for the main lodging page
 */
export function generateLodgingBusinessSchema(units?: RentalUnit[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: BRAND_NAME,
    description:
      "Unique vacation rentals including vintage Airstreams, cozy cottages, and event spaces near Dillard Mill State Historic Site in Missouri's Mark Twain National Forest.",
    url: `${SITE_URL}/lodging`,
    telephone: PHONE,
    address: PINE_VALLEY_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.7241,
      longitude: -91.2061,
    },
    priceRange: "$$",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "WiFi",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Parking",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Pet Friendly",
        value: true,
      },
    ],
  };

  return {
    ...schema,
    ...(units?.length
      ? {
          containsPlace: units.map((unit) => ({
            "@type": "Accommodation",
            name: unit.name,
            description: unit.shortDescription,
            url: `${SITE_URL}${getUnitUrl(unit.slug.current)}`,
          })),
        }
      : {}),
  };
}

/**
 * Generates VacationRental schema for individual unit pages
 */
export function generateVacationRentalSchema(unit: RentalUnit) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com";
  const images = unitPhotos(unit)
    .slice(0, 8)
    .map((p) => new URL(p.src, site).toString());

  // Build amenity features from unit amenities
  const amenityFeatures =
    unit.amenities?.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.name,
      value: true,
    })) || [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: unit.name,
    description: unit.shortDescription || "",
    url: `${SITE_URL}${getUnitUrl(unit.slug.current)}`,
    telephone: PHONE,
    address: PINE_VALLEY_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.7241,
      longitude: -91.2061,
    },
    ...(images.length > 0 && { image: images }),
    ...(unit.basePrice > 0 && {
      offers: {
        "@type": "Offer",
        price: unit.basePrice?.toString() || "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}${getUnitUrl(unit.slug.current)}`,
      },
    }),
    numberOfRooms: unit.bedrooms || 1,
    numberOfBedrooms: unit.bedrooms || 1,
    numberOfBathroomsTotal: unit.bathrooms || 1,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: unit.maxGuests || 1,
    },
    amenityFeature: amenityFeatures,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
  };

  return schema;
}

/**
 * Generates a JSON-LD script tag for use in Next.js metadata or components
 */
export function generateJsonLdScript(schema: object) {
  return {
    __html: JSON.stringify(schema),
  };
}
