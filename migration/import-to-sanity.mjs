// Script to import content to Sanity
import { config } from 'dotenv';
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Sample data structure - we'll populate this from your export
const sampleAmenities = [
  { name: 'WiFi', icon: 'wifi', category: 'general', description: 'High-speed internet access' },
  { name: 'Hot Tub', icon: 'hot-tub', category: 'outdoor', description: 'Private outdoor hot tub' },
  { name: 'Fire Pit', icon: 'fire', category: 'outdoor', description: 'Outdoor fire pit with seating' },
  { name: 'Full Kitchen', icon: 'kitchen', category: 'kitchen', description: 'Fully equipped kitchen' },
  { name: 'Parking', icon: 'parking', category: 'general', description: 'Free on-site parking' },
  { name: 'Pet Friendly', icon: 'pet', category: 'general', description: 'Pets welcome' },
  { name: 'Fireplace', icon: 'fireplace', category: 'indoor', description: 'Indoor fireplace' },
  { name: 'Air Conditioning', icon: 'ac', category: 'indoor', description: 'Central A/C' },
  { name: 'Heating', icon: 'heat', category: 'indoor', description: 'Central heating' },
  { name: 'Washer/Dryer', icon: 'washer', category: 'indoor', description: 'In-unit laundry' },
];

async function createAmenities() {
  console.log('📝 Creating amenities...\n');

  const createdAmenities = [];

  for (const amenity of sampleAmenities) {
    try {
      const doc = await client.create({
        _type: 'amenity',
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category,
        description: amenity.description,
      });

      console.log(`✅ Created: ${amenity.name} (${doc._id})`);
      createdAmenities.push(doc);
    } catch (error) {
      console.error(`❌ Failed to create ${amenity.name}:`, error.message);
    }
  }

  return createdAmenities;
}

async function createSampleUnit(amenities) {
  console.log('\n📝 Creating sample rental unit...\n');

  try {
    const doc = await client.create({
      _type: 'rentalUnit',
      name: 'Sample Cabin',
      slug: { _type: 'slug', current: 'sample-cabin' },
      shortDescription: 'A beautiful cabin near Dillard Mill with modern amenities and rustic charm.',
      description: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Welcome to our beautiful cabin! This spacious retreat offers the perfect blend of rustic charm and modern comfort.',
            },
          ],
        },
      ],
      basePrice: 150,
      cleaningFee: 75,
      minStay: 2,
      maxGuests: 6,
      bedrooms: 2,
      bathrooms: 1.5,
      beds: [
        { _type: 'bedConfiguration', type: 'Queen', count: 1 },
        { _type: 'bedConfiguration', type: 'Twin', count: 2 },
      ],
      amenities: amenities.slice(0, 5).map(a => ({
        _type: 'reference',
        _ref: a._id,
      })),
      available: true,
      featured: true,
      sortOrder: 0,
    });

    console.log(`✅ Created rental unit: ${doc.name} (${doc._id})`);
    return doc;
  } catch (error) {
    console.error('❌ Failed to create rental unit:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Sanity import...\n');
  console.log('Project:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
  console.log('\n─────────────────────────────────────────────\n');

  try {
    // Create amenities first (they're referenced by units)
    const amenities = await createAmenities();

    // Create a sample unit
    await createSampleUnit(amenities);

    console.log('\n─────────────────────────────────────────────');
    console.log('\n✅ Import complete!');
    console.log('\n📍 View in Sanity Studio:');
    console.log('   http://localhost:3000/studio');
    console.log('\n💡 Next: Replace this sample data with your actual content\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createAmenities, createSampleUnit };
