# Pine Valley SEO Enhancement Plan

**Goal:** Improve search visibility and rich results for Pine Valley vacation rental listings.

## Structured Data Implementation

### 1. VacationRental Schema (JSON-LD)
Google has [official documentation](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental) for vacation rental markup.

**Benefits:**
- Enhanced search results with pricing, ratings, amenities
- Better visibility in Google Travel / Google Maps
- Rich snippets showing key property details

**Implementation:**
```typescript
// For each unit (Airstream, Cottage, etc.)
{
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "name": "Pine Valley Airstream",
  "description": "...",
  "image": [...],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Davisville",
    "addressRegion": "MO",
    "postalCode": "...",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "...",
    "longitude": "..."
  },
  "amenityFeature": [
    {"@type": "LocationFeatureSpecification", "name": "WiFi", "value": true},
    {"@type": "LocationFeatureSpecification", "name": "Kitchen", "value": true},
    // etc.
  ],
  "containsPlace": {
    "@type": "Accommodation",
    "additionalType": "EntirePlace",
    "bed": [
      {"@type": "BedDetails", "numberOfBeds": 1, "typeOfBed": "Queen"}
    ],
    "occupancy": {
      "@type": "QuantitativeValue",
      "value": 2
    }
  },
  "checkinTime": "16:00",
  "checkoutTime": "11:00"
}
```

### 2. LocalBusiness Schema
For the overall Pine Valley property:
```typescript
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Pine Valley Lodging & Events",
  "image": [...],
  "address": {...},
  "geo": {...},
  "telephone": "...",
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "..."
  }
}
```

### 3. Open Graph Tags
Enhanced social media previews:
```html
<meta property="og:title" content="Pine Valley - Airstream & Cottage Rentals" />
<meta property="og:description" content="43 acres near Dillard Mill..." />
<meta property="og:image" content="https://..." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://..." />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

## Floating SEO Elements

### 1. Review Widget
- Floating badge showing aggregate rating
- "See Reviews" button → reviews section
- Google/Airbnb review aggregation
- Could use a service like ReviewTrackers or custom implementation

### 2. Availability Indicator
- Floating "Check Availability" button
- Quick date picker overlay
- Shows next available dates
- Drives conversions

### 3. Breadcrumb Navigation
Structured breadcrumbs for SEO:
```typescript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pinevalley.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Airstream",
      "item": "https://pinevalley.com/airstream"
    }
  ]
}
```

## Technical SEO Improvements

### 1. Dynamic Meta Tags
Per-page meta tags based on content:
```typescript
// src/app/[unit]/page.tsx
export async function generateMetadata({ params }) {
  const unit = await getUnit(params.unit);
  return {
    title: `${unit.name} - Pine Valley Lodging`,
    description: unit.description,
    openGraph: {
      title: unit.name,
      description: unit.description,
      images: [unit.mainImage],
    },
  };
}
```

### 2. Sitemap.xml
Auto-generated from Sanity content:
```typescript
// src/app/sitemap.ts
export default async function sitemap() {
  const units = await getUnits();
  return [
    { url: 'https://pinevalley.com', lastModified: new Date() },
    ...units.map(unit => ({
      url: `https://pinevalley.com/${unit.slug}`,
      lastModified: unit.updatedAt,
    })),
  ];
}
```

### 3. robots.txt
```
User-agent: *
Allow: /
Sitemap: https://pinevalley.com/sitemap.xml
```

## Local SEO

### 1. Google Business Profile Integration
- Ensure GBP is claimed & verified
- Regular posts about availability, events
- Respond to reviews
- Add photos regularly

### 2. Location Pages
Create dedicated pages for nearby attractions:
- `/the-area/dillard-mill`
- `/the-area/floating-outfitters`
- `/the-area/hiking-trails`

Benefits:
- Rank for "lodging near [attraction]"
- Internal linking opportunities
- Content for chatbot knowledge base

## Implementation Priority

### Week 1
- [x] Research structured data standards
- [x] Create SEO implementation plan
- [ ] Add VacationRental schema to unit pages
- [ ] Add LocalBusiness schema to homepage
- [ ] Implement dynamic meta tags

### Week 2
- [ ] Create sitemap.xml generator
- [ ] Add Open Graph tags
- [ ] Build floating review widget
- [ ] Test with Google Rich Results tool

### Week 3
- [ ] Location-based content pages
- [ ] Breadcrumb schema
- [ ] Performance monitoring (Google Search Console)

## Tools for Validation
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Open Graph Debugger](https://www.opengraph.xyz/)

## Expected Impact
- 📈 Better search rankings for location-based queries
- 🌟 Rich snippets showing ratings, pricing, amenities
- 🎯 Higher click-through rates from search results
- 💰 More direct bookings (vs. Airbnb fees)

## Files to Create/Modify
1. `src/components/seo/JsonLd.tsx` - Schema markup component
2. `src/lib/seo/schemas.ts` - Schema generators
3. `src/app/sitemap.ts` - Sitemap generator
4. `src/app/robots.ts` - Robots.txt generator
5. Unit page templates - Add generateMetadata()
6. `src/components/floating/ReviewWidget.tsx` - Floating review badge
