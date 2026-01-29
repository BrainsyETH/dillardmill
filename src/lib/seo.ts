import { Metadata } from 'next';

export const siteConfig = {
  name: 'Pine Valley Lodging & Events',
  description: '43 acres in Missouri\'s Mark Twain National Forest. Unique accommodations including Airstreams, cottages, and event space near Dillard Mill State Historic Site.',
  url: 'https://pinevalleylodging.com',
  ogImage: '/og-image.jpg',
  keywords: [
    'Missouri lodging',
    'Dillard Mill',
    'Mark Twain National Forest',
    'Missouri camping',
    'Airstream rental Missouri',
    'Missouri vacation rental',
    'outdoor lodging Missouri',
    'Missouri event venue',
    'glamping Missouri',
    'Missouri retreats',
    'Ozarks lodging',
    'Missouri getaway',
  ],
};

export function generateSEOMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: 'Pine Valley' }],
    creator: 'Pine Valley',
    publisher: 'Pine Valley',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: '@pinevalleylodge',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    ...overrides,
  };
}

// Structured Data for Local Business
export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Pine Valley Lodging & Events',
    image: `${siteConfig.url}/og-image.jpg`,
    '@id': siteConfig.url,
    url: siteConfig.url,
    telephone: '+1-573-XXX-XXXX', // TODO: Add real phone number
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Dillard Mill State Historic Site',
      addressLocality: 'Davisville',
      addressRegion: 'MO',
      postalCode: '65456',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.154, // TODO: Add exact coordinates
      longitude: -91.391,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    sameAs: [
      // TODO: Add social media URLs
      // 'https://www.facebook.com/pinevalleylodge',
      // 'https://www.instagram.com/pinevalleylodge',
    ],
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Parking',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'WiFi',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Pet Friendly',
        value: true,
      },
    ],
  };
}

// Structured Data for Camping Ground (alternative/additional schema)
export function generateCampgroundStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Campground',
    name: 'Pine Valley Lodging & Events',
    description: siteConfig.description,
    image: `${siteConfig.url}/og-image.jpg`,
    url: siteConfig.url,
    telephone: '+1-573-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Davisville',
      addressRegion: 'MO',
      postalCode: '65456',
      addressCountry: 'US',
    },
    amenityFeature: [
      'Glamping',
      'Airstream Rentals',
      'Event Space',
      'Hiking Trails',
      'Outdoor Activities',
    ],
  };
}
