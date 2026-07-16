/**
 * Floating outfitters near Pine Valley, grouped by river.
 *
 * Drive times are approximate, measured from the property. Each river carries
 * an `eddySlug` used by the River Conditions badge (see RiverConditionsBadge)
 * and the "Full report on Eddy" link (https://eddy.guide/rivers/<eddySlug>).
 */

export const PROPERTY_ORIGIN = '126 Dillard Mill Rd, Davisville, MO 65456';

export type OutfitterTagKind = 'best' | 'nps';

export interface OutfitterTag {
  label: string;
  /** `best` = warm highlight (closest / primary); `nps` = National Park Service concessioner */
  kind: OutfitterTagKind;
}

export interface Outfitter {
  name: string;
  /** Street / town line shown under the name */
  address: string;
  phone?: string;
  email?: string;
  /** Middot-separated list of services & highlights */
  services: string;
  /** Outfitter website (external). Omitted when the outfitter has no site. */
  website?: string;
  /** Approximate drive time from the property, e.g. "~30 min" */
  driveTime: string;
  /** Google Maps destination string (address or place query) */
  destination: string;
  tags?: OutfitterTag[];
}

export interface River {
  name: string;
  /** Eddy river slug — powers the conditions badge + report link */
  eddySlug: string;
  /** Difficulty class, e.g. "Class I–II" */
  waterClass: string;
  /** Short descriptor line, e.g. "29 mi floatable · sharp turns, narrow channels" */
  meta: string;
  outfitters: Outfitter[];
}

/** Build a Google Maps directions URL from the property to a destination. */
export function buildDirectionsUrl(destination: string): string {
  const params = new URLSearchParams({
    api: '1',
    origin: PROPERTY_ORIGIN,
    destination,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Eddy live-conditions report URL for a river slug. */
export function eddyReportUrl(eddySlug: string): string {
  return `https://eddy.guide/rivers/${encodeURIComponent(eddySlug)}`;
}

export const rivers: River[] = [
  {
    name: 'Huzzah Creek',
    eddySlug: 'huzzah',
    waterClass: 'Class I–II',
    meta: '29 mi floatable · sharp turns, narrow channels',
    outfitters: [
      {
        name: 'Huzzah Valley Resort',
        address: '970 E Hwy 8, Steelville',
        phone: '(573) 786-2225',
        services: 'Canoe · Kayak · Raft · Tube · Cabins · Restaurant · Pool · Horseback',
        website: 'https://huzzahvalley.com/',
        driveTime: '~30 min',
        destination: '970 E Hwy 8, Steelville, MO 65565',
        tags: [{ label: 'Closest', kind: 'best' }],
      },
      {
        name: 'Bass River Resort',
        address: '204 Butts Rd, Steelville',
        phone: '(573) 786-8517',
        services: 'Canoe · Kayak · Raft · Cabins · Camping · Horseback · Family-run 50+ years',
        website: 'https://bassresort.com/',
        driveTime: '~35 min',
        destination: '204 Butts Rd, Steelville, MO 65565',
      },
      {
        name: 'Ozark Outdoors Resort',
        address: '200 Ozark Outdoor Lane, Leasburg',
        phone: '(573) 245-6837',
        services: 'Canoe · Kayak · Raft · Tube · Cabins · Aerial Park · Pool',
        website: 'https://ozarkoutdoorsresort.com/',
        driveTime: '~40 min',
        destination: '200 Ozark Outdoor Lane, Leasburg, MO 65535',
      },
      {
        name: 'The Rafting Company',
        address: 'Steelville',
        email: 'rafting@theraftingco.com',
        services: 'Canoe · Kayak · Raft · Shuttle',
        driveTime: '~40 min',
        destination: 'The Rafting Company Steelville MO',
      },
    ],
  },
  {
    name: 'Courtois Creek',
    eddySlug: 'courtois',
    waterClass: 'Class I–II',
    meta: '21 mi · “coat-a-way” · intimate, scenic',
    outfitters: [
      {
        name: 'Bass River Resort',
        address: '204 Butts Rd, Steelville',
        phone: '(573) 786-8517',
        services: 'Camp-to-camp floats · directly on the Courtois',
        website: 'https://bassresort.com/',
        driveTime: '~35 min',
        destination: '204 Butts Rd, Steelville, MO 65565',
        tags: [{ label: 'On the Courtois', kind: 'best' }],
      },
      {
        name: 'Huzzah Valley Resort',
        address: '970 E Hwy 8, Steelville',
        phone: '(573) 786-2225',
        services: 'Courtois floats · Canoe · Kayak · Raft · Tube',
        website: 'https://huzzahvalley.com/',
        driveTime: '~30 min',
        destination: '970 E Hwy 8, Steelville, MO 65565',
      },
      {
        name: 'Ozark Outdoors Resort',
        address: '200 Ozark Outdoor Lane, Leasburg',
        phone: '(573) 245-6837',
        services: 'Courtois Primitive · Butts Slab routes · 5–10 mi floats',
        website: 'https://ozarkoutdoorsresort.com/',
        driveTime: '~40 min',
        destination: '200 Ozark Outdoor Lane, Leasburg, MO 65535',
      },
    ],
  },
  {
    name: 'Meramec River',
    eddySlug: 'meramec',
    waterClass: 'Class I',
    meta: '218 mi · wide, relaxed, swimming holes & bluffs',
    outfitters: [
      {
        name: 'Ozark Outdoors Resort',
        address: '200 Ozark Outdoor Lane, Leasburg',
        phone: '(573) 245-6837',
        services: '“The Y” · Tube Loop · 1 mi riverfront · Canoe · Kayak · Raft',
        website: 'https://ozarkoutdoorsresort.com/',
        driveTime: '~40 min',
        destination: '200 Ozark Outdoor Lane, Leasburg, MO 65535',
        tags: [{ label: 'Primary Meramec', kind: 'best' }],
      },
      {
        name: 'Meramec River Resort',
        address: '1441 Birds Nest Rd, Steelville',
        phone: '(573) 775-2606',
        services: 'Canoe · Kayak · Raft · Cabins · Lodge · 29 acres riverfront',
        website: 'https://meramecriverresort.com/',
        driveTime: '~40 min',
        destination: '1441 Birds Nest Rd, Steelville, MO 65565',
        tags: [{ label: 'Bird’s Nest', kind: 'best' }],
      },
      {
        name: 'Adventure Outdoors (Fagan’s)',
        address: '247 Thurman Lake Rd, Steelville',
        phone: '(573) 775-5744',
        services: 'Upper Meramec · Scotts Ford · Canoe · Kayak · Raft',
        website: 'http://adventureoutdoorcanoeing.com/',
        driveTime: '~45 min',
        destination: '247 Thurman Lake Rd, Steelville, MO 65565',
      },
      {
        name: 'Garrison’s River Resort',
        address: '287 State Hwy TT, Steelville',
        phone: '(573) 775-2410',
        services: 'Canoe · Kayak · Raft · Tube · Pool · 180 sites',
        website: 'https://garrisonscampground.com/',
        driveTime: '~45 min',
        destination: '287 State Hwy TT, Steelville, MO 65565',
      },
      {
        name: 'Lucky Clover Lakeside Resort',
        address: '69 Lucky Clover Rd, Steelville',
        services: '100 acres · Canoe · Kayak · Raft · Tube · 2 lakes · Pool',
        website: 'https://luckyclovercampground.com/',
        driveTime: '~50 min',
        destination: '69 Lucky Clover Rd, Steelville, MO 65565',
      },
      {
        name: 'Riverview Ranch',
        address: '7945 Hwy N, Bourbon',
        phone: '(573) 732-5544',
        services: 'Canoe · Kayak · Raft · Tube · 5 & 10 mi floats · Cabins',
        website: 'http://riverviewranch.org/',
        driveTime: '~55 min',
        destination: '7945 Hwy N, Bourbon, MO 65441',
      },
    ],
  },
  {
    name: 'Current River',
    eddySlug: 'current',
    waterClass: 'Class I',
    meta: '184 mi · spring-fed · Ozark National Scenic Riverways',
    outfitters: [
      {
        name: 'Jadwin Canoe Rental',
        address: '8754 Hwy K, Jadwin',
        phone: '(573) 729-5229',
        services: 'Mid-Current · Cedar Grove · 3–94 mi trips · Trout fishing',
        website: 'http://jadwincanoe.com/',
        driveTime: '~1 hr',
        destination: '8754 Hwy K, Jadwin, MO 65501',
        tags: [
          { label: 'NPS', kind: 'nps' },
          { label: 'Closest', kind: 'best' },
        ],
      },
      {
        name: 'Running River Canoe Rental',
        address: '17685 S Hwy 19, Salem',
        phone: '(573) 858-3371',
        services: 'Upper Current · Family-owned since 1979 · Canoe · Kayak · Raft',
        driveTime: '~1 hr',
        destination: '17685 S Hwy 19, Salem, MO 65560',
      },
      {
        name: 'Akers Ferry Canoe Rental',
        address: '36869 State Route K, Salem',
        phone: '(573) 858-3224',
        services: 'Akers Ferry · most popular put-in · full shuttle · Camping',
        website: 'https://akersferrycanoe.com/',
        driveTime: '~1h 10m',
        destination: '36869 State Route K, Salem, MO 65560',
        tags: [{ label: 'NPS', kind: 'nps' }],
      },
      {
        name: 'Current River Canoe Rental',
        address: '31104 County Rd EE-356, Salem',
        phone: '(573) 858-3250',
        services: 'Pulltite & Cedar Grove · upper Current · Canoe · Kayak · Raft',
        website: 'https://currentrivercanoe.com/',
        driveTime: '~1h 15m',
        destination: '31104 County Rd EE-356, Salem, MO 65560',
        tags: [{ label: 'NPS', kind: 'nps' }],
      },
      {
        name: 'Carr’s Canoe Rental',
        address: 'Round Spring, Eminence',
        phone: '(573) 858-3240',
        services: 'Round Spring · 50+ years · Echo Bluff State Park service',
        website: 'https://www.carrscanoerental.com/',
        driveTime: '~1h 30m',
        destination: 'Carrs Canoe Rental Round Spring Eminence MO',
      },
      {
        name: 'Two Rivers Canoe Rental',
        address: '21575 State Hwy V, Eminence',
        phone: '(573) 226-3478',
        services: 'Current/Jacks Fork junction · Year-round floats · Camping',
        website: 'https://www.2riverscanoe.com/',
        driveTime: '~1h 50m',
        destination: '21575 State Hwy V, Eminence, MO 65466',
      },
      {
        name: 'Harvey’s Alley Spring',
        address: '13863 MO-106, Eminence',
        phone: '(573) 226-3386',
        services: 'Alley Spring · est. 1963 · Jacks Fork & Current',
        website: 'https://harveysalleyspring.com/',
        driveTime: '~1h 50m',
        destination: '13863 MO-106, Eminence, MO 65466',
        tags: [{ label: 'NPS', kind: 'nps' }],
      },
      {
        name: 'Windy’s Floats',
        address: '513 N Main, Eminence',
        phone: '(573) 226-3404',
        services: 'Largest on Jacks Fork · since 1969 · Pet-friendly shuttle',
        website: 'https://windysfloats.com/',
        driveTime: '~1h 50m',
        destination: '513 N Main St, Eminence, MO 65466',
        tags: [{ label: 'NPS', kind: 'nps' }],
      },
      {
        name: 'Silver Arrow Canoe Rental',
        address: 'Van Buren',
        phone: '(573) 323-4657',
        services: 'Lower Current · Big Spring area · Canoe · Kayak · Tube',
        driveTime: '~2h 15m',
        destination: 'Silver Arrow Canoe Rental Van Buren MO',
      },
    ],
  },
];
