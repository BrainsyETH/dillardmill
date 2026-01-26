// Import Pine Valley content to Sanity
import { config } from 'dotenv';
import { createClient } from '@sanity/client';
import fs from 'fs';

config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Read the Pine Valley data
const data = JSON.parse(fs.readFileSync('./migration/pine-valley-data.json', 'utf-8'));

// All amenities from the data
const ALL_AMENITIES = [
  // From Cozy Cottage
  { name: 'Washer & Dryer', icon: 'washer', category: 'indoor' },
  { name: 'Full Kitchen', icon: 'kitchen', category: 'kitchen' },
  { name: 'Shower Bathroom', icon: 'shower', category: 'indoor' },
  { name: 'Propane Fireplace', icon: 'fireplace', category: 'indoor' },
  { name: 'Air Conditioning', icon: 'ac', category: 'indoor' },
  { name: 'Baseboard Heaters', icon: 'heat', category: 'indoor' },
  { name: 'TV with DVDs', icon: 'tv', category: 'entertainment' },
  { name: 'Private Patio', icon: 'deck', category: 'outdoor' },
  { name: 'Pet Friendly', icon: 'pet', category: 'general' },

  // From Airstream
  { name: 'Private Outdoor Tub', icon: 'hot-tub', category: 'outdoor' },
  { name: 'Outdoor Shower', icon: 'shower', category: 'outdoor' },
  { name: 'Indoor Toilet and Sink', icon: 'bathroom', category: 'indoor' },
  { name: 'Kitchenette', icon: 'kitchen', category: 'kitchen' },
  { name: 'Microwave', icon: 'microwave', category: 'kitchen' },
  { name: 'Small Fridge', icon: 'fridge', category: 'kitchen' },
  { name: 'Toaster Oven', icon: 'oven', category: 'kitchen' },
  { name: 'Electric Skillet', icon: 'cooking', category: 'kitchen' },
  { name: 'Coffee Maker', icon: 'coffee', category: 'kitchen' },
  { name: 'Electric Heater', icon: 'heat', category: 'indoor' },
  { name: 'Private Deck', icon: 'deck', category: 'outdoor' },

  // From Sebastian
  { name: 'Two Outdoor Clawfoot Tubs', icon: 'hot-tub', category: 'outdoor' },
  { name: 'Campfire Area', icon: 'fire', category: 'outdoor' },
  { name: 'Self Check-in', icon: 'key', category: 'general' },
  { name: 'Fridge', icon: 'fridge', category: 'kitchen' },

  // From Book the Farm
  { name: 'Multi-purpose Café', icon: 'cafe', category: 'general' },
  { name: '3 RV Pads', icon: 'rv', category: 'outdoor' },
  { name: 'Concrete RV Pad with Full Service', icon: 'rv', category: 'outdoor' },
  { name: 'Private Decks', icon: 'deck', category: 'outdoor' },
  { name: 'Bonfire Pits', icon: 'fire', category: 'outdoor' },
  { name: 'Walking Distance to Dillard Mill', icon: 'walk', category: 'general' },
  { name: 'WiFi', icon: 'wifi', category: 'general' },
  { name: 'Event Space', icon: 'event', category: 'general' },
];

// Remove duplicates
const uniqueAmenities = ALL_AMENITIES.filter((amenity, index, self) =>
  index === self.findIndex((t) => t.name === amenity.name)
);

async function createAmenities() {
  console.log('📝 Creating amenities...\n');
  const created = [];

  for (const amenity of uniqueAmenities) {
    try {
      const doc = await client.create({
        _type: 'amenity',
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category,
      });
      console.log(`✅ ${amenity.name}`);
      created.push(doc);
    } catch (error) {
      console.error(`❌ ${amenity.name}:`, error.message);
    }
  }

  return created;
}

async function createRentalUnits(amenities) {
  console.log('\n📝 Creating rental units...\n');

  for (const unit of data.rentalUnits) {
    try {
      // Find amenity references
      const amenityRefs = unit.amenities.map(name => {
        const amenity = amenities.find(a => a.name === name);
        return amenity ? { _type: 'reference', _ref: amenity._id } : null;
      }).filter(Boolean);

      // Handle beds
      const beds = unit.beds ? unit.beds.map(bed => ({
        _type: 'bedConfiguration',
        type: bed.type,
        count: bed.count,
      })) : [];

      const doc = await client.create({
        _type: 'rentalUnit',
        name: unit.name,
        slug: { _type: 'slug', current: unit.slug },
        shortDescription: unit.description,
        description: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: unit.description,
              },
            ],
          },
        ],
        maxGuests: unit.capacity,
        bedrooms: typeof unit.bedrooms === 'number' ? unit.bedrooms : 0,
        bathrooms: typeof unit.bathrooms === 'number' ? unit.bathrooms : 0,
        beds: beds,
        amenities: amenityRefs,
        airbnbUrl: unit.airbnbUrl,
        featured: unit.featured,
        available: true,
        sortOrder: unit.featured ? 0 : 1,
      });

      console.log(`✅ ${unit.name}`);
    } catch (error) {
      console.error(`❌ ${unit.name}:`, error.message);
    }
  }
}

async function createAttractions() {
  console.log('\n📝 Creating local attractions...\n');

  const attractions = [
    {
      name: 'Dillard Mill State Historic Site',
      slug: 'dillard-mill',
      description: 'A restored gristmill from 1908 located on Huzzah Creek. One of the state\'s best-preserved gristmills with original machinery intact. Visitors can fish, hike, and picnic along the scenic Ozark waterway.',
      distance: 'Walking distance',
    },
    {
      name: 'Mark Twain National Forest',
      slug: 'mark-twain-forest',
      description: 'Expansive forest system offering extensive outdoor recreation with over 750 miles of trails for hiking, horseback riding, mountain biking, and motorized use.',
      distance: 'On property',
    },
    {
      name: 'Huzzah River',
      slug: 'huzzah-river',
      description: 'A clearwater stream approximately 100 miles from St. Louis. Great for floating, fishing, and enjoying Missouri\'s natural beauty.',
      distance: '0.5 miles (trail from entrance)',
    },
    {
      name: 'Viburnum Country Club',
      slug: 'viburnum-country-club',
      description: 'Golf facility north of Viburnum featuring multiple tee lengths and scenic terrain suitable for both beginners and experienced players.',
      distance: 'Nearby',
    },
  ];

  // Create category first
  let categoryDoc;
  try {
    categoryDoc = await client.create({
      _type: 'attractionCategory',
      name: 'Outdoor Recreation',
      slug: { _type: 'slug', current: 'outdoor-recreation' },
    });
    console.log('✅ Created category: Outdoor Recreation');
  } catch (error) {
    console.error('❌ Category:', error.message);
  }

  for (const attraction of attractions) {
    try {
      const doc = await client.create({
        _type: 'attraction',
        name: attraction.name,
        slug: { _type: 'slug', current: attraction.slug },
        description: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: attraction.description,
              },
            ],
          },
        ],
        distance: attraction.distance,
        category: categoryDoc ? { _type: 'reference', _ref: categoryDoc._id } : undefined,
      });
      console.log(`✅ ${attraction.name}`);
    } catch (error) {
      console.error(`❌ ${attraction.name}:`, error.message);
    }
  }
}

async function createSiteSettings() {
  console.log('\n📝 Creating site settings...\n');

  try {
    const doc = await client.create({
      _type: 'siteSettings',
      _id: 'siteSettings',
      siteName: data.siteName,
      tagline: data.tagline,
      email: data.contact.email,
      phone: data.contact.phone,
      address: `${data.location.address}, ${data.location.city}, ${data.location.state} ${data.location.zip}`,
      navigation: [
        { label: 'Home', url: '/' },
        { label: 'Accommodations', url: '/units' },
        { label: 'Gallery', url: '/gallery' },
        { label: 'The Area', url: '/area' },
        { label: 'Reviews', url: '/reviews' },
        { label: 'Contact', url: '/contact' },
      ],
      bookingNotice: 'Book directly through Airbnb or Hipcamp, or contact us for group bookings.',
      airbnbProfileUrl: 'https://www.airbnb.com/users/show/309588444',
      socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/pinevalleydm' },
        { platform: 'Facebook', url: 'https://facebook.com/pinevalley' },
      ],
      copyrightText: `© ${new Date().getFullYear()} Pine Valley. All rights reserved.`,
      seo: {
        defaultTitle: 'Pine Valley | Lodging, Camping, & Events near Dillard Mill',
        defaultDescription: '43 acres in Missouri\'s Mark Twain National Forest. Unique accommodations including Airstreams, cottages, and event space near Dillard Mill State Historic Site.',
      },
    });
    console.log('✅ Site Settings created');
  } catch (error) {
    console.error('❌ Site Settings:', error.message);
  }
}

async function main() {
  console.log('🚀 Importing Pine Valley content to Sanity...\n');
  console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
  console.log('\n─────────────────────────────────────────────\n');

  try {
    const amenities = await createAmenities();
    await createRentalUnits(amenities);
    await createAttractions();
    await createSiteSettings();

    console.log('\n─────────────────────────────────────────────');
    console.log('\n✅ Pine Valley content imported successfully!');
    console.log('\n📍 View in Sanity Studio:');
    console.log('   http://localhost:3000/studio');
    console.log('\n💡 Next steps:');
    console.log('   1. Upload images for each unit');
    console.log('   2. Add pricing information');
    console.log('   3. Review and refine descriptions\n');
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
