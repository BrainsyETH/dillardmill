// Script to feature "Book the Farm" and unfeature all other units
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function featureBookTheFarm() {
  console.log('🔍 Finding all rental units...');

  // Get all units
  const units = await client.fetch('*[_type == "rentalUnit"]{ _id, name, featured, sortOrder }');

  console.log(`Found ${units.length} units`);

  const bookTheFarm = units.find(u => u.name === 'Book the Farm');

  if (!bookTheFarm) {
    console.log('❌ "Book the Farm" unit not found');
    console.log('Available units:', units.map(u => u.name).join(', '));
    return;
  }

  console.log(`\n✅ Found "Book the Farm" (ID: ${bookTheFarm._id})`);

  // Set Book the Farm as featured with sortOrder = 1
  console.log('\n📌 Setting "Book the Farm" as featured (sortOrder: 1)...');
  await client
    .patch(bookTheFarm._id)
    .set({ featured: true, sortOrder: 1 })
    .commit();

  console.log('✅ "Book the Farm" is now featured');

  // Unfeature all other units
  console.log('\n📝 Unfeaturing all other units...');
  for (const unit of units) {
    if (unit._id !== bookTheFarm._id) {
      await client
        .patch(unit._id)
        .set({
          featured: false,
          sortOrder: unit.sortOrder || 99,
        })
        .commit();
      console.log(`  ✓ ${unit.name} - unfeatured`);
    }
  }

  console.log('\n🎉 Done! "Book the Farm" is now the only featured listing.');
  console.log('   It will appear first on the Units page.\n');
}

featureBookTheFarm()
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
