// Parse Squarespace WordPress XML export
import { config } from 'dotenv';
import fs from 'fs';
import { parseStringPromise } from 'xml2js';

config({ path: '.env.local' });

async function parseSquarespaceExport(xmlFilePath) {
  console.log('📖 Reading XML file...\n');

  if (!fs.existsSync(xmlFilePath)) {
    console.error('❌ File not found:', xmlFilePath);
    console.log('\n💡 Place your Squarespace export XML in the migration folder');
    console.log('   and name it: squarespace-export.xml\n');
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

  console.log('⚙️  Parsing XML...\n');
  const parsed = await parseStringPromise(xmlContent);

  const channel = parsed.rss.channel[0];
  const items = channel.item || [];

  console.log(`📊 Found ${items.length} items\n`);
  console.log('─────────────────────────────────────────────\n');

  const posts = [];
  const pages = [];
  const images = [];

  for (const item of items) {
    const title = item.title?.[0] || 'Untitled';
    const content = item['content:encoded']?.[0] || '';
    const postType = item['wp:post_type']?.[0] || 'post';
    const postDate = item.pubDate?.[0] || '';
    const slug = item['wp:post_name']?.[0] || '';

    const entry = {
      title,
      content,
      postType,
      postDate,
      slug,
      excerpt: item.description?.[0] || '',
      author: item['dc:creator']?.[0] || '',
      categories: item.category?.map(c => c._) || [],
    };

    if (postType === 'post') {
      posts.push(entry);
      console.log(`📝 Blog Post: "${title}"`);
    } else if (postType === 'page') {
      pages.push(entry);
      console.log(`📄 Page: "${title}"`);
    }

    // Extract image URLs from content
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('\n📊 Summary:');
  console.log(`   Pages: ${pages.length}`);
  console.log(`   Blog Posts: ${posts.length}`);
  console.log(`   Images found: ${images.length}`);

  // Save parsed data
  const outputDir = './migration/parsed';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    `${outputDir}/pages.json`,
    JSON.stringify(pages, null, 2)
  );
  fs.writeFileSync(
    `${outputDir}/posts.json`,
    JSON.stringify(posts, null, 2)
  );
  fs.writeFileSync(
    `${outputDir}/images.json`,
    JSON.stringify([...new Set(images)], null, 2)
  );

  console.log('\n✅ Saved parsed data to migration/parsed/');
  console.log('   - pages.json');
  console.log('   - posts.json');
  console.log('   - images.json\n');

  return { pages, posts, images };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const xmlPath = process.argv[2] || './migration/squarespace-export.xml';
  parseSquarespaceExport(xmlPath);
}

export { parseSquarespaceExport };
