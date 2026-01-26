import type { RentalUnit } from './sanity/schemas';
import { urlFor } from './sanity/client';

/**
 * Common address information for Pine Valley at Dillard Mill
 */
const PINE_VALLEY_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '126 Dillard Mill Road',
  addressLocality: 'Davisville',
  addressRegion: 'MO',
  postalCode: '65456',
  addressCountry: 'US',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dillardmill.com';
const PHONE = '(314) 843-4321';
const BRAND_NAME = 'Pine Valley at Dillard Mill';

/**
 * Generates LodgingBusiness schema for the main lodging page
 */
export function generateLodgingBusinessSchema(units?: RentalUnit[]) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: BRAND_NAME,
    description: 'Unique vacation rentals including vintage Airstreams, cozy cottages, and event spaces near Dillard Mill State Historic Site in Missouri\'s Mark Twain National Forest.',
    url: `${SITE_URL}/lodging`,
    telephone: PHONE,
    address: PINE_VALLEY_ADDRESS,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.2653,
      longitude: -91.2312,
    },
    priceRange: '$$',
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'WiFi',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Parking',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Pet Friendly',
        value: true,
      },
    ],
  };

  // Add accommodations if units are provided
  if (units && units.length > 0) {
    (schema as any).containsPlace = units.map((unit) => ({
      '@type': 'Accommodation',
      name: unit.name,
      description: unit.shortDescription,
      url: `${SITE_URL}/${unit.slug.current}`,
    }));
  }

  return schema;
}

/**
 * Generates VacationRental schema for individual unit pages
 */
export function generateVacationRentalSchema(unit: RentalUnit) {
  const images: string[] = [];

  // Add featured image if available
  if (unit.featuredImage?.image) {
    try {
      const imageUrl = urlFor(unit.featuredImage.image).width(1200).url();
      images.push(imageUrl);
    } catch (error) {
      console.warn('Failed to generate featured image URL for schema.org', error);
    }
  }

  // Add additional images
  if (unit.images && unit.images.length > 0) {
    unit.images.forEach((img) => {
      try {
        const imageUrl = urlFor(img.image).width(1200).url();
        if (!images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      } catch (error) {
        console.warn('Failed to generate image URL for schema.org', error);
      }
    });
  }

  // Build amenity features from unit amenities
  const amenityFeatures = unit.amenities?.map((amenity) => ({
    '@type': 'LocationFeatureSpecification',
    name: amenity.name,
    value: true,
  })) || [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    name: unit.name,
    description: unit.shortDescription || '',
    url: `${SITE_URL}/${unit.slug.current}`,
    telephone: PHONE,
    address: PINE_VALLEY_ADDRESS,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.2653,
      longitude: -91.2312,
    },
    ...(images.length > 0 && { image: images }),
    offers: {
      '@type': 'Offer',
      price: unit.basePrice?.toString() || '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/${unit.slug.current}`,
    },
    numberOfRooms: unit.bedrooms || 1,
    numberOfBedrooms: unit.bedrooms || 1,
    numberOfBathroomsTotal: unit.bathrooms || 1,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: unit.maxGuests || 1,
    },
    amenityFeature: amenityFeatures,
    brand: {
      '@type': 'Brand',
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
