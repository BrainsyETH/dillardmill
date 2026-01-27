/**
 * Schema.org Structured Data Generators
 * 
 * Creates JSON-LD markup for vacation rentals and local business.
 * Helps with SEO and Google Rich Results.
 */

interface Address {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

interface Amenity {
  name: string;
  value: boolean;
}

interface BedDetails {
  numberOfBeds: number;
  typeOfBed: string;
}

interface VacationRentalData {
  name: string;
  description: string;
  images: string[];
  address: Address;
  geo: GeoCoordinates;
  amenities: Amenity[];
  beds: BedDetails[];
  maxOccupancy: number;
  checkinTime: string;
  checkoutTime: string;
  priceRange?: string;
  url: string;
}

interface LocalBusinessData {
  name: string;
  description: string;
  images: string[];
  address: Address;
  geo: GeoCoordinates;
  telephone?: string;
  email?: string;
  priceRange: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  url: string;
}

/**
 * Generate VacationRental schema for individual units
 * https://developers.google.com/search/docs/appearance/structured-data/vacation-rental
 */
export function generateVacationRentalSchema(data: VacationRentalData) {
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "name": data.name,
    "description": data.description,
    "image": data.images,
    "url": data.url,
    "address": {
      "@type": "PostalAddress",
      ...data.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.geo.latitude,
      "longitude": data.geo.longitude
    },
    "amenityFeature": data.amenities.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity.name,
      "value": amenity.value
    })),
    "containsPlace": {
      "@type": "Accommodation",
      "additionalType": "EntirePlace",
      "bed": data.beds.map(bed => ({
        "@type": "BedDetails",
        "numberOfBeds": bed.numberOfBeds,
        "typeOfBed": bed.typeOfBed
      })),
      "occupancy": {
        "@type": "QuantitativeValue",
        "value": data.maxOccupancy
      }
    },
    "checkinTime": data.checkinTime,
    "checkoutTime": data.checkoutTime,
    ...(data.priceRange && { "priceRange": data.priceRange })
  };
}

/**
 * Generate LocalBusiness schema for overall property
 * https://schema.org/LodgingBusiness
 */
export function generateLocalBusinessSchema(data: LocalBusinessData) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": data.name,
    "description": data.description,
    "image": data.images,
    "url": data.url,
    "address": {
      "@type": "PostalAddress",
      ...data.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.geo.latitude,
      "longitude": data.geo.longitude
    },
    "priceRange": data.priceRange
  };

  if (data.telephone) schema.telephone = data.telephone;
  if (data.email) schema.email = data.email;
  
  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": data.aggregateRating.ratingValue,
      "reviewCount": data.aggregateRating.reviewCount
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Pine Valley property data (shared constants)
 */
export const PINE_VALLEY_BASE = {
  address: {
    streetAddress: "", // TODO: Add actual address
    addressLocality: "Davisville",
    addressRegion: "MO",
    postalCode: "", // TODO: Add postal code
    addressCountry: "US"
  },
  geo: {
    latitude: 0, // TODO: Add actual coordinates
    longitude: 0
  }
};

/**
 * Common amenities across units
 */
export const COMMON_AMENITIES = [
  { name: "WiFi", value: true },
  { name: "Kitchen", value: true },
  { name: "Parking", value: true },
  { name: "Pet Friendly", value: false },
  { name: "Air Conditioning", value: false }, // Verify
  { name: "Heating", value: true }
];
