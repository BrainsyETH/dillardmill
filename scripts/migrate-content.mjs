#!/usr/bin/env node

/**
 * Pine Valley at Dillard Mill — Sanity Content Migration Script
 *
 * Populates Sanity CMS with all content from the existing Squarespace site.
 * Run with: node scripts/migrate-content.mjs
 *
 * NOTE: Images must be uploaded manually via Sanity Studio after running this
 * script, since Squarespace blocks automated image downloads.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blockText(text) {
  return text.split('\n\n').map((paragraph, i) => ({
    _type: 'block',
    _key: `block-${i}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${i}`,
        text: paragraph.trim(),
        marks: [],
      },
    ],
  }));
}

async function createDoc(doc) {
  try {
    const result = await client.createOrReplace(doc);
    console.log(`  ✓ Created ${doc._type}: ${doc._id}`);
    return result;
  } catch (err) {
    console.error(`  ✗ Failed ${doc._type}: ${doc._id} — ${err.message}`);
    throw err;
  }
}

function ref(id) {
  return { _type: 'reference', _ref: id, _key: id };
}

// ─── 1. Amenities ─────────────────────────────────────────────────────────────

const amenities = [
  { _id: 'amenity-wifi',            name: 'WiFi',                     icon: 'wifi',          category: 'general' },
  { _id: 'amenity-ac',              name: 'Air Conditioning',         icon: 'snowflake',     category: 'indoor' },
  { _id: 'amenity-heating',         name: 'Baseboard Heaters',        icon: 'thermometer',   category: 'indoor' },
  { _id: 'amenity-fireplace',       name: 'Propane Fireplace',        icon: 'fire',          category: 'indoor' },
  { _id: 'amenity-kitchen',         name: 'Full Kitchen',             icon: 'kitchen',       category: 'kitchen' },
  { _id: 'amenity-private-patio',   name: 'Private Patio',            icon: 'patio',         category: 'outdoor' },
  { _id: 'amenity-grill',           name: 'Grill',                    icon: 'grill',         category: 'outdoor' },
  { _id: 'amenity-fire-pit',        name: 'Campfire Pit',             icon: 'fire-pit',      category: 'outdoor' },
  { _id: 'amenity-fishing',         name: 'Fishing Ponds',            icon: 'fish',          category: 'outdoor' },
  { _id: 'amenity-hiking',          name: 'Private Hiking Trails',    icon: 'hiking',        category: 'outdoor' },
  { _id: 'amenity-pet-friendly',    name: 'Pet Friendly ($50/stay)',  icon: 'paw',           category: 'general' },
  { _id: 'amenity-parking',         name: 'Free Parking',             icon: 'car',           category: 'general' },
  { _id: 'amenity-rv-hookup',       name: 'RV Hookups',               icon: 'rv',            category: 'outdoor' },
  { _id: 'amenity-tent-camping',    name: 'Tent Camping',             icon: 'tent',          category: 'outdoor' },
  { _id: 'amenity-indoor-plumbing', name: 'Indoor Plumbing',          icon: 'plumbing',      category: 'indoor' },
  { _id: 'amenity-shower-house',    name: 'Outdoor Bath & Shower House', icon: 'shower',     category: 'outdoor' },
  { _id: 'amenity-event-space',     name: 'Multi-Purpose Event Space', icon: 'event',        category: 'indoor' },
  { _id: 'amenity-private-entrance',name: 'Private Entrance',         icon: 'door',          category: 'indoor' },
];

// ─── 2. Rental Units ─────────────────────────────────────────────────────────

const rentalUnits = [
  {
    _id: 'unit-cozy-cottage',
    name: 'Cozy Cottage',
    slug: { _type: 'slug', current: 'cozycottage' },
    shortDescription: 'Attached to the main house with its own entrance and private patio overlooking the courtyard and barn.',
    description: blockText(
      `The Cozy Cottage is attached to the main house but separated by an external breezeway, with its own entrance and private patio overlooking the courtyard and barn.\n\n` +
      `It features an open loft-style bedroom with a full bed and premium futon sleeper. Stay warm with baseboard heaters and a propane fireplace, or cool off with two window AC units.\n\n` +
      `Enjoy a peaceful stay within walking distance of Dillard Mill. Relax on your private patio and fire up the grill.\n\n` +
      `Pets are welcome for an extra $50 per stay.`
    ),
    basePrice: 125,
    cleaningFee: 50,
    minStay: 2,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-full', type: 'Full', count: 1 },
      { _type: 'bedConfiguration', _key: 'bed-sofa', type: 'Sofa', count: 1 },
    ],
    amenities: [
      ref('amenity-ac'),
      ref('amenity-heating'),
      ref('amenity-fireplace'),
      ref('amenity-private-patio'),
      ref('amenity-grill'),
      ref('amenity-pet-friendly'),
      ref('amenity-private-entrance'),
      ref('amenity-wifi'),
      ref('amenity-parking'),
      ref('amenity-indoor-plumbing'),
    ],
    airbnbUrl: 'https://www.airbnb.com/rooms/29332611',
    available: true,
    featured: true,
    sortOrder: 1,
    seo: {
      _type: 'seo',
      title: 'Cozy Cottage - Pine Valley at Dillard Mill',
      description: 'Stay in the Cozy Cottage at Pine Valley near historic Dillard Mill. Private patio, fireplace, sleeps 4. Pet friendly. In the heart of the Ozarks.',
    },
  },
  {
    _id: 'unit-argosy-airstream',
    name: 'The Argosy Airstream',
    slug: { _type: 'slug', current: 'airstream' },
    shortDescription: 'A camping-style getaway with a queen bed, set away from the main house with a private deck and great view.',
    description: blockText(
      `The Argosy Airstream is set away from the main house for a private, secluded feel with a private deck and a great view of the property.\n\n` +
      `While this space provides most utilities and amenities you'd find at your home, it is still a camping-style getaway. It sleeps up to 4 with a queen bed and two twin beds.\n\n` +
      `Air conditioned for summer comfort. This is a sleeping-quarters-only unit with no plumbing — a convenient full bathroom is available in the barn.`
    ),
    basePrice: 95,
    cleaningFee: 35,
    minStay: 2,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 0,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-queen', type: 'Queen', count: 1 },
      { _type: 'bedConfiguration', _key: 'bed-twin', type: 'Twin', count: 2 },
    ],
    amenities: [
      ref('amenity-ac'),
      ref('amenity-shower-house'),
      ref('amenity-wifi'),
      ref('amenity-parking'),
      ref('amenity-fire-pit'),
      ref('amenity-fishing'),
      ref('amenity-hiking'),
    ],
    airbnbUrl: 'https://www.airbnb.com/rooms/27518141',
    available: true,
    featured: true,
    sortOrder: 2,
    seo: {
      _type: 'seo',
      title: 'The Argosy Airstream - Pine Valley at Dillard Mill',
      description: 'Glamping in a vintage Airstream at Pine Valley near Dillard Mill. Sleeps 4, air conditioned, private deck. Missouri Ozarks getaway.',
    },
  },
  {
    _id: 'unit-sherman-airstream',
    name: 'The Sherman Airstream',
    slug: { _type: 'slug', current: 'sebastian' },
    shortDescription: 'A vintage airstream experience with a queen bed and twin beds. Air conditioned with a private deck.',
    description: blockText(
      `The Sherman Airstream offers a unique glamping experience at Pine Valley. Spaced generously from other units for a private, secluded feel.\n\n` +
      `Sleeps up to 4 with a queen size bed and two twin beds. Air conditioned for summer comfort.\n\n` +
      `This is a sleeping-quarters-only unit with no plumbing — a convenient full bathroom is available in the barn.`
    ),
    basePrice: 95,
    cleaningFee: 35,
    minStay: 2,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 0,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-queen', type: 'Queen', count: 1 },
      { _type: 'bedConfiguration', _key: 'bed-twin', type: 'Twin', count: 2 },
    ],
    amenities: [
      ref('amenity-ac'),
      ref('amenity-shower-house'),
      ref('amenity-wifi'),
      ref('amenity-parking'),
      ref('amenity-fire-pit'),
      ref('amenity-fishing'),
      ref('amenity-hiking'),
    ],
    airbnbUrl: 'https://www.airbnb.com/rooms/29634317',
    available: true,
    featured: false,
    sortOrder: 3,
    seo: {
      _type: 'seo',
      title: 'The Sherman Airstream - Pine Valley at Dillard Mill',
      description: 'Stay in the Sherman Airstream at Pine Valley. Glamping near historic Dillard Mill in the Missouri Ozarks. Sleeps 4, air conditioned.',
    },
  },
  {
    _id: 'unit-tiny-cabin-1',
    name: 'Tiny Cabin #1',
    slug: { _type: 'slug', current: 'tiny-cabin-1' },
    shortDescription: 'A cozy tiny cabin with a queen bed. Air conditioned sleeping quarters perfect for two.',
    description: blockText(
      `Tiny Cabin #1 is a cozy retreat perfect for couples or solo travelers looking for a quiet getaway in the Ozarks.\n\n` +
      `Sleeps 2 with 1 queen bed. Air conditioned for summer comfort.\n\n` +
      `This is a sleeping-quarters-only cabin with no plumbing. Guests share the Hippy Showers & Bathrooms, and a convenient full bathroom is also available in the barn.`
    ),
    basePrice: 75,
    cleaningFee: 25,
    minStay: 2,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 0,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-queen', type: 'Queen', count: 1 },
    ],
    amenities: [
      ref('amenity-ac'),
      ref('amenity-shower-house'),
      ref('amenity-wifi'),
      ref('amenity-parking'),
      ref('amenity-fire-pit'),
      ref('amenity-fishing'),
      ref('amenity-hiking'),
    ],
    available: true,
    featured: false,
    sortOrder: 4,
    seo: {
      _type: 'seo',
      title: 'Tiny Cabin #1 - Pine Valley at Dillard Mill',
      description: 'Tiny cabin retreat at Pine Valley near Dillard Mill. Queen bed, AC, perfect for couples. Missouri Ozarks getaway.',
    },
  },
  {
    _id: 'unit-tiny-cabin-2',
    name: 'Tiny Cabin #2',
    slug: { _type: 'slug', current: 'tiny-cabin-2' },
    shortDescription: 'A cozy tiny cabin with a queen bed. Air conditioned sleeping quarters perfect for two.',
    description: blockText(
      `Tiny Cabin #2 is another cozy retreat perfect for couples or solo travelers at Pine Valley.\n\n` +
      `Sleeps 2 with 1 queen bed. Air conditioned for summer comfort.\n\n` +
      `This is a sleeping-quarters-only cabin with no plumbing. Guests share the Hippy Showers & Bathrooms, and a convenient full bathroom is also available in the barn.`
    ),
    basePrice: 75,
    cleaningFee: 25,
    minStay: 2,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 0,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-queen', type: 'Queen', count: 1 },
    ],
    amenities: [
      ref('amenity-ac'),
      ref('amenity-shower-house'),
      ref('amenity-wifi'),
      ref('amenity-parking'),
      ref('amenity-fire-pit'),
      ref('amenity-fishing'),
      ref('amenity-hiking'),
    ],
    available: true,
    featured: false,
    sortOrder: 5,
    seo: {
      _type: 'seo',
      title: 'Tiny Cabin #2 - Pine Valley at Dillard Mill',
      description: 'Tiny cabin retreat at Pine Valley near Dillard Mill. Queen bed, AC, perfect for couples. Missouri Ozarks getaway.',
    },
  },
  {
    _id: 'unit-book-the-farm',
    name: 'Book the Farm',
    slug: { _type: 'slug', current: 'book-the-farm' },
    shortDescription: 'Book the entire property for weddings, reunions, and group getaways. Sleeps 20+ in beds, up to 50 with camping.',
    description: blockText(
      `Pine Valley is the perfect place for weddings, birthdays, family reunions, and more — offering private event options and lodging geared to keeping everyone in your party happy.\n\n` +
      `The Farm sleeps 20+ in comfy beds and up to 50 with RV & tent camping. A multi-purpose building seats up to 50 for your own private indoor party or dinner.\n\n` +
      `All units are included when you Book the Farm: Cozy Cottage, both Airstreams, and both Tiny Cabins. Plus RV pads — 1 concrete pad with full service and 2 grass pads with limited service.\n\n` +
      `You can also pitch a tent in the large backyard lawn, or for the more adventurous, hike down to the woods and set up your own primitive campsite.\n\n` +
      `Pricing: $1,600 for up to 10 guests for 2 nights. Guests 11–30 are $100 per person. Guests 31–50 (camping) are $40 per person for 2 nights.\n\n` +
      `Check-in is at 12pm Friday and checkout is at 12pm Sunday (2-night minimum).`
    ),
    basePrice: 800,
    cleaningFee: 200,
    minStay: 2,
    maxGuests: 50,
    bedrooms: 5,
    bathrooms: 2,
    beds: [
      { _type: 'bedConfiguration', _key: 'bed-queen-1', type: 'Queen', count: 3 },
      { _type: 'bedConfiguration', _key: 'bed-twin-1', type: 'Twin', count: 4 },
      { _type: 'bedConfiguration', _key: 'bed-full-1', type: 'Full', count: 1 },
      { _type: 'bedConfiguration', _key: 'bed-sofa-1', type: 'Sofa', count: 1 },
    ],
    amenities: [
      ref('amenity-wifi'),
      ref('amenity-ac'),
      ref('amenity-heating'),
      ref('amenity-fireplace'),
      ref('amenity-kitchen'),
      ref('amenity-private-patio'),
      ref('amenity-grill'),
      ref('amenity-fire-pit'),
      ref('amenity-fishing'),
      ref('amenity-hiking'),
      ref('amenity-pet-friendly'),
      ref('amenity-parking'),
      ref('amenity-rv-hookup'),
      ref('amenity-tent-camping'),
      ref('amenity-indoor-plumbing'),
      ref('amenity-shower-house'),
      ref('amenity-event-space'),
    ],
    airbnbUrl: 'https://www.airbnb.com/rooms/44360355',
    available: true,
    featured: true,
    sortOrder: 0,
    seo: {
      _type: 'seo',
      title: 'Book the Farm - Pine Valley at Dillard Mill',
      description: 'Book all of Pine Valley for your group event. Sleeps 20+ in beds, up to 50 with camping. Weddings, reunions, private events near Dillard Mill, Missouri.',
    },
  },
];

// ─── 3. Attraction Categories ─────────────────────────────────────────────────

const attractionCategories = [
  { _id: 'attrcat-historic',    name: 'Historic Sites',     slug: { _type: 'slug', current: 'historic-sites' } },
  { _id: 'attrcat-hiking',      name: 'Hiking & Nature',    slug: { _type: 'slug', current: 'hiking-nature' } },
  { _id: 'attrcat-water',       name: 'Water Activities',   slug: { _type: 'slug', current: 'water-activities' } },
  { _id: 'attrcat-on-property', name: 'On Property',        slug: { _type: 'slug', current: 'on-property' } },
];

// ─── 4. Attractions ───────────────────────────────────────────────────────────

const attractions = [
  {
    _id: 'attraction-dillard-mill',
    name: 'Dillard Mill State Historic Site',
    slug: { _type: 'slug', current: 'dillard-mill' },
    category: ref('attrcat-historic'),
    description: blockText(
      `A red mill set on the blue waters of Huzzah Creek is the setting for Dillard Mill State Historic Site, which interprets one of the state's best-preserved gristmills.\n\n` +
      `Completed in 1908 as the Mische Mill, most of the machinery is still intact. It was operational until 1956 and renamed Dillard Mill in 1975 when the State of Missouri took over management.\n\n` +
      `Tours are given of the mill and of the Wilhite Store by appointment. Just a quarter-mile walk from Pine Valley.`
    ),
    distance: '0.25 miles',
    website: 'https://mostateparks.com/park/dillard-mill-state-historic-site',
    location: { lat: 37.6217, lng: -91.4033 },
  },
  {
    _id: 'attraction-huzzah-creek-trail',
    name: 'Huzzah Creek Trail',
    slug: { _type: 'slug', current: 'huzzah-creek-trail' },
    category: ref('attrcat-hiking'),
    description: blockText(
      `A half-mile trail starting directly across from the entrance at Pine Valley through the Mark Twain National Forest.\n\n` +
      `Skip rocks on the Huzzah Creek, go fishing, swimming, or just relax by the water.`
    ),
    distance: 'Across the road',
  },
  {
    _id: 'attraction-dillard-mill-walk',
    name: 'Dillard Mill Walk',
    slug: { _type: 'slug', current: 'dillard-mill-walk' },
    category: ref('attrcat-hiking'),
    description: blockText(
      `A 1.4-mile lightly trafficked out-and-back trail near Davisville, Missouri that features a lake and is good for all skill levels.\n\n` +
      `The trail is primarily used for hiking, walking, and nature trips.`
    ),
    distance: '1.4 miles',
  },
  {
    _id: 'attraction-huzzah-creek',
    name: 'Huzzah Creek',
    slug: { _type: 'slug', current: 'huzzah-creek' },
    category: ref('attrcat-water'),
    description: blockText(
      `Huzzah Creek is a popular Missouri Ozarks waterway for floating, fishing, and swimming.\n\n` +
      `Fish for sunfish, smallmouth bass, and largemouth bass. Pine Valley is located right along the creek.`
    ),
    distance: '0.25 miles',
  },
  {
    _id: 'attraction-mark-twain-national-forest',
    name: 'Mark Twain National Forest',
    slug: { _type: 'slug', current: 'mark-twain-national-forest' },
    category: ref('attrcat-hiking'),
    description: blockText(
      `Pine Valley is nearly surrounded by the Mark Twain National Forest, which has over 750 miles of trails for hiking, horseback riding, mountain biking, and motorized use.\n\n` +
      `There are plenty of trails throughout the forest, and Pine Valley also offers a couple of small, private trails on the property (1.5–2 miles).`
    ),
    distance: 'Adjacent',
  },
  {
    _id: 'attraction-fishing-ponds',
    name: 'Pine Valley Fishing Ponds',
    slug: { _type: 'slug', current: 'fishing-ponds' },
    category: ref('attrcat-on-property'),
    description: blockText(
      `Two ponds on the Pine Valley premises stocked for fishing. Enjoy a relaxing day of fishing steps from your lodging.`
    ),
    distance: 'On property',
  },
  {
    _id: 'attraction-private-trails',
    name: 'Pine Valley Private Hiking Trails',
    slug: { _type: 'slug', current: 'private-trails' },
    category: ref('attrcat-on-property'),
    description: blockText(
      `Pine Valley offers 1.5 to 2 miles of private hiking trails on the 43-acre property. Explore the woodland and pastures of the Ozarks.`
    ),
    distance: 'On property',
  },
];

// ─── 5. Blog Post (Floating Guide) ───────────────────────────────────────────

const blogCategories = [
  { _id: 'blogcat-activities', name: 'Activities',    slug: { _type: 'slug', current: 'activities' } },
  { _id: 'blogcat-guides',    name: 'Travel Guides',  slug: { _type: 'slug', current: 'travel-guides' } },
];

const authors = [
  {
    _id: 'author-pine-valley',
    name: 'Pine Valley',
    slug: { _type: 'slug', current: 'pine-valley' },
    bio: blockText('Your hosts at Pine Valley at Dillard Mill — your gateway to the Mark Twain National Forest and the Ozarks.'),
  },
];

const blogPosts = [
  {
    _id: 'blog-floating-guide',
    title: 'The Extensive Guide to Floating',
    slug: { _type: 'slug', current: 'floating-guide' },
    author: ref('author-pine-valley'),
    categories: [ref('blogcat-activities'), ref('blogcat-guides')],
    publishedAt: '2023-06-15T00:00:00Z',
    excerpt: 'Everything you need to know about floating the rivers near Pine Valley and Dillard Mill in the Missouri Ozarks.',
    body: blockText(
      `Pine Valley is located in the heart of the Mark Twain National Forest and set on 43 acres of beautiful green pasture and woodland.\n\n` +
      `Floating the Huzzah Creek and nearby rivers is one of the most popular activities in the area. This guide covers everything you need to know to plan your floating trip.\n\n` +
      `The Huzzah Creek is right at our doorstep — guests can walk to the creek and enjoy fishing, swimming, and relaxing by the water.\n\n` +
      `Contact us for recommendations on local outfitters and the best put-in points for your float trip.`
    ),
    seo: {
      _type: 'seo',
      title: 'The Extensive Guide to Floating - Pine Valley at Dillard Mill',
      description: 'Everything you need to know about floating rivers near Dillard Mill in the Missouri Ozarks. Tips, outfitters, and more.',
    },
  },
];

// ─── 6. Site Settings ─────────────────────────────────────────────────────────

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'Pine Valley at Dillard Mill',
  tagline: 'Your gateway to historic Dillard Mill and the Mark Twain National Forest',
  email: 'pinevalley@dillardmill.com',
  phone: '(314) 843-4321',
  address: 'Davisville, Missouri\nIn the heart of the Mark Twain National Forest',
  navigation: [
    { _type: 'object', _key: 'nav-lodging',   label: 'Lodging',           url: '/lodging' },
    { _type: 'object', _key: 'nav-farm',      label: 'Book the Farm',     url: '/book-the-farm' },
    { _type: 'object', _key: 'nav-area',      label: 'Our Place',         url: '/our-place' },
    { _type: 'object', _key: 'nav-photos',    label: 'Photos',            url: '/photos' },
    { _type: 'object', _key: 'nav-mill',      label: 'Dillard Mill',      url: '/dillardmill' },
    { _type: 'object', _key: 'nav-trails',    label: 'Trails',            url: '/trails' },
    { _type: 'object', _key: 'nav-contact',   label: 'Contact',           url: '/contact' },
  ],
  footerColumns: [
    {
      _type: 'object',
      _key: 'footer-lodging',
      title: 'Lodging',
      links: [
        { _type: 'object', _key: 'fl-cottage',  label: 'Cozy Cottage',         url: '/cozycottage' },
        { _type: 'object', _key: 'fl-airstream', label: 'The Argosy Airstream', url: '/airstream' },
        { _type: 'object', _key: 'fl-sherman',   label: 'The Sherman Airstream', url: '/sebastian' },
        { _type: 'object', _key: 'fl-cabin1',    label: 'Tiny Cabin #1',        url: '/tiny-cabin-1' },
        { _type: 'object', _key: 'fl-cabin2',    label: 'Tiny Cabin #2',        url: '/tiny-cabin-2' },
        { _type: 'object', _key: 'fl-farm',      label: 'Book the Farm',        url: '/book-the-farm' },
      ],
    },
    {
      _type: 'object',
      _key: 'footer-explore',
      title: 'Explore',
      links: [
        { _type: 'object', _key: 'fe-place',   label: 'Our Place',         url: '/our-place' },
        { _type: 'object', _key: 'fe-mill',     label: 'Dillard Mill',      url: '/dillardmill' },
        { _type: 'object', _key: 'fe-trails',   label: 'Hiking Trails',     url: '/trails' },
        { _type: 'object', _key: 'fe-attract',  label: 'Local Attractions', url: '/the-area' },
        { _type: 'object', _key: 'fe-photos',   label: 'Photos',            url: '/photos' },
        { _type: 'object', _key: 'fe-blog',     label: 'Blog',              url: '/thoughts' },
      ],
    },
    {
      _type: 'object',
      _key: 'footer-contact',
      title: 'Contact',
      links: [
        { _type: 'object', _key: 'fc-booking', label: 'Booking Request',   url: '/booking-request' },
        { _type: 'object', _key: 'fc-contact', label: 'Contact Us',        url: '/contact' },
      ],
    },
  ],
  copyrightText: `© ${new Date().getFullYear()} Pine Valley at Dillard Mill. All rights reserved.`,
  bookingNotice: 'Check-in is at 12pm Friday and checkout is at 12pm Sunday. 2-night minimum stay required. Contact us at (314) 843-4321 or pinevalley@dillardmill.com to book.',
  airbnbProfileUrl: 'https://www.airbnb.com/users/show/198286498',
  seo: {
    _type: 'seo',
    title: 'Pine Valley at Dillard Mill — Lodging, Camping & Events in the Missouri Ozarks',
    description: 'Pine Valley at Dillard Mill is nestled on 40 private acres in the heart of the Ozarks. Indoor lodging, glamping, primitive camping, and private events near historic Dillard Mill.',
  },
};

// ─── Run Migration ────────────────────────────────────────────────────────────

async function migrate() {
  console.log('🏔  Pine Valley at Dillard Mill — Content Migration');
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Amenities
  console.log('📦 Step 1: Creating amenities...');
  for (const a of amenities) {
    await createDoc({ ...a, _type: 'amenity' });
  }

  // Step 2: Rental Units (without images — those go through Studio)
  console.log('\n🏠 Step 2: Creating rental units...');
  console.log('   ⚠  Images must be uploaded manually via Sanity Studio');
  for (const unit of rentalUnits) {
    // Remove images validation requirement by providing a placeholder note
    await createDoc({
      ...unit,
      _type: 'rentalUnit',
      // Images array left empty — upload via Studio
    });
  }

  // Step 3: Attraction Categories
  console.log('\n🗂  Step 3: Creating attraction categories...');
  for (const cat of attractionCategories) {
    await createDoc({ ...cat, _type: 'attractionCategory' });
  }

  // Step 4: Attractions
  console.log('\n📍 Step 4: Creating attractions...');
  for (const attr of attractions) {
    await createDoc({ ...attr, _type: 'attraction' });
  }

  // Step 5: Blog infrastructure
  console.log('\n📝 Step 5: Creating blog categories & authors...');
  for (const cat of blogCategories) {
    await createDoc({ ...cat, _type: 'blogCategory' });
  }
  for (const author of authors) {
    await createDoc({ ...author, _type: 'author' });
  }

  // Step 6: Blog Posts
  console.log('\n📰 Step 6: Creating blog posts...');
  for (const post of blogPosts) {
    await createDoc({ ...post, _type: 'blogPost' });
  }

  // Step 7: Site Settings
  console.log('\n⚙️  Step 7: Creating site settings...');
  await createDoc(siteSettings);

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ Migration complete!\n');
  console.log('📊 Summary:');
  console.log(`   • ${amenities.length} amenities`);
  console.log(`   • ${rentalUnits.length} rental units`);
  console.log(`   • ${attractionCategories.length} attraction categories`);
  console.log(`   • ${attractions.length} attractions`);
  console.log(`   • ${blogCategories.length} blog categories`);
  console.log(`   • ${authors.length} authors`);
  console.log(`   • ${blogPosts.length} blog posts`);
  console.log(`   • 1 site settings document`);
  console.log('\n⚠️  NEXT STEPS:');
  console.log('   1. Open Sanity Studio at http://localhost:3000/studio');
  console.log('   2. Upload images for each rental unit');
  console.log('   3. Upload images for attractions');
  console.log('   4. Upload the site logo');
  console.log('   5. Add guest reviews manually');
  console.log('   6. Verify all content matches the Squarespace site');
  console.log('   7. Add iCal sync URLs for each unit from Airbnb/VRBO');
}

migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
