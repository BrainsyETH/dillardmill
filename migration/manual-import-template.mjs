// Manual import template - customize with your actual data
import { config } from 'dotenv';
import { createClient } from '@sanity/client';

config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ============================================================
// CUSTOMIZE THIS DATA WITH YOUR ACTUAL RENTAL INFORMATION
// ============================================================

const YOUR_RENTAL_UNITS = [
  {
    name: 'Your Unit Name Here',
    slug: 'your-unit-slug',
    shortDescription: 'Brief description (160 chars max)',
    fullDescription: `Full description with details about the unit.

    You can include multiple paragraphs here.`,

    // Pricing
    basePrice: 150, // Nightly rate
    cleaningFee: 75,
    minStay: 2, // Minimum nights

    // Capacity
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 1.5, // Use decimals for half baths

    // Beds
    beds: [
      { type: 'Queen', count: 1 },
      { type: 'Twin', count: 2 },
    ],

    // Amenities (list the names)
    amenities: [
      'WiFi',
      'Hot Tub',
      'Full Kitchen',
      'Parking',
      'Fire Pit',
    ],

    // Booking links
    airbnbUrl: 'https://airbnb.com/...',
    vrboUrl: 'https://vrbo.com/...',

    // Settings
    featured: true, // Show on homepage
    available: true,
    sortOrder: 0,
  },

  // Add more units here...
  // {
  //   name: 'Second Unit',
  //   slug: 'second-unit',
  //   ...
  // },
];

const YOUR_AMENITIES = [
  { name: 'WiFi', icon: 'wifi', category: 'general' },
  { name: 'Hot Tub', icon: 'hot-tub', category: 'outdoor' },
  { name: 'Fire Pit', icon: 'fire', category: 'outdoor' },
  { name: 'Full Kitchen', icon: 'kitchen', category: 'kitchen' },
  { name: 'Parking', icon: 'parking', category: 'general' },
  { name: 'Pet Friendly', icon: 'pet', category: 'general' },
  // Add all your amenities...
];

const YOUR_REVIEWS = [
  {
    guestName: 'John Doe',
    rating: 5,
    reviewText: 'Amazing stay! The cabin was beautiful and clean.',
    reviewDate: '2025-01-15',
    stayDate: 'January 2025',
    unitName: 'Your Unit Name Here',
    source: 'Airbnb',
    verified: true,
    featured: true,
  },
  // Add more reviews...
];

// ============================================================
// IMPORT FUNCTIONS
// ============================================================

async function importAmenities() {
  console.log('📝 Creating amenities...\n');
  const created = [];

  for (const amenity of YOUR_AMENITIES) {
    try {
      const doc = await client.create({
        _type: 'amenity',
        ...amenity,
      });
      console.log(`✅ ${amenity.name}`);
      created.push(doc);
    } catch (error) {
      console.error(`❌ ${amenity.name}:`, error.message);
    }
  }

  return created;
}

async function importUnits(amenities) {
  console.log('\n📝 Creating rental units...\n');

  for (const unit of YOUR_RENTAL_UNITS) {
    try {
      // Find amenity references
      const amenityRefs = unit.amenities.map(name => {
        const amenity = amenities.find(a => a.name === name);
        return amenity ? { _type: 'reference', _ref: amenity._id } : null;
      }).filter(Boolean);

      const doc = await client.create({
        _type: 'rentalUnit',
        name: unit.name,
        slug: { _type: 'slug', current: unit.slug },
        shortDescription: unit.shortDescription,
        description: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: unit.fullDescription,
              },
            ],
          },
        ],
        basePrice: unit.basePrice,
        cleaningFee: unit.cleaningFee,
        minStay: unit.minStay,
        maxGuests: unit.maxGuests,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        beds: unit.beds.map(bed => ({
          _type: 'bedConfiguration',
          type: bed.type,
          count: bed.count,
        })),
        amenities: amenityRefs,
        airbnbUrl: unit.airbnbUrl,
        vrboUrl: unit.vrboUrl,
        featured: unit.featured,
        available: unit.available,
        sortOrder: unit.sortOrder,
      });

      console.log(`✅ ${unit.name}`);
    } catch (error) {
      console.error(`❌ ${unit.name}:`, error.message);
    }
  }
}

async function importReviews() {
  console.log('\n📝 Creating reviews...\n');

  // First get unit references
  const units = await client.fetch('*[_type == "rentalUnit"]{ _id, name }');

  for (const review of YOUR_REVIEWS) {
    try {
      const unit = units.find(u => u.name === review.unitName);

      const doc = await client.create({
        _type: 'review',
        guestName: review.guestName,
        rating: review.rating,
        reviewText: review.reviewText,
        reviewDate: review.reviewDate,
        stayDate: review.stayDate,
        unit: unit ? { _type: 'reference', _ref: unit._id } : undefined,
        source: review.source,
        verified: review.verified,
        featured: review.featured,
      });

      console.log(`✅ Review from ${review.guestName}`);
    } catch (error) {
      console.error(`❌ Review:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting manual import...\n');
  console.log('─────────────────────────────────────────────\n');

  try {
    const amenities = await importAmenities();
    await importUnits(amenities);
    await importReviews();

    console.log('\n─────────────────────────────────────────────');
    console.log('\n✅ Import complete!');
    console.log('\n📍 View in Sanity Studio:');
    console.log('   http://localhost:3000/studio\n');
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
