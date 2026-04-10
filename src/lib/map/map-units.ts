export type MarkerType = 'unit' | 'landmark';

export type UnitType = 'cabin' | 'airstream' | 'cafe' | 'tiny-cabin';

export interface MapUnit {
  id: string;
  name: string;
  type: MarkerType;
  unitType?: UnitType;
  description: string;
  capacity?: number;
  beds?: string;
  amenities?: string[];
  plumbing?: 'full' | 'shared-barn';
  detailUrl?: string;
  bookingUrl?: string;
  // Optional image URL shown in the popup
  image?: string;
  // Visibility flags — default to true if undefined
  showOnLayout?: boolean;
  showOnLocation?: boolean;
  // Geographic coordinates for the Mapbox satellite map
  coordinates: { lng: number; lat: number };
  // Position on the drone photo layout view, as percentages (0-100)
  layoutPosition: { x: number; y: number };
}

// Property center: 126 Dillard Mill Road, Davisville, MO 65456
export const PROPERTY_CENTER = { lng: -91.2061, lat: 37.7241 };
export const DEFAULT_ZOOM = 16;

// Drone photo used as the base for the Property Layout view
export const DRONE_PHOTO_URL = '/property-drone.PNG';

export const mapUnits: MapUnit[] = [
  // === Rental Units ===
  {
    id: 'cozy-cottage',
    name: 'Cozy Cottage',
    type: 'unit',
    unitType: 'cabin',
    description: 'Sleeps 4 with full kitchen, bath, A/C, and full plumbing. Perfect for couples or small families.',
    capacity: 4,
    beds: '2 Double Beds',
    amenities: ['Kitchen', 'Full Bath', 'A/C', 'Washer & Dryer', 'Propane Fireplace'],
    plumbing: 'full',
    detailUrl: '/cozycottage',
    bookingUrl: 'https://www.airbnb.com/rooms/29332611',
    coordinates: { lng: -91.2068, lat: 37.7248 },
    layoutPosition: { x: 35, y: 30 },
  },
  {
    id: 'the-airstream',
    name: 'The Airstream',
    type: 'unit',
    unitType: 'airstream',
    description: 'Vintage Airstream with outdoor shower and clawfoot tub. A unique glamping experience.',
    capacity: 2,
    beds: '1 Queen Bed',
    amenities: ['Kitchenette', 'Outdoor Shower', 'Clawfoot Tub', 'Deck', 'A/C'],
    plumbing: 'full',
    detailUrl: '/airstream',
    bookingUrl: 'https://www.airbnb.com/rooms/27518141',
    coordinates: { lng: -91.2055, lat: 37.7245 },
    layoutPosition: { x: 55, y: 35 },
  },
  {
    id: 'the-sebastian',
    name: 'The Sebastian',
    type: 'unit',
    unitType: 'cabin',
    description: 'Spacious unit with 2 outdoor clawfoot tubs. Great for families or groups.',
    capacity: 4,
    beds: '1 Queen + 2 Twins',
    amenities: ['Kitchenette', 'Outdoor Shower', '2 Clawfoot Tubs', 'Campfire Area', 'A/C'],
    plumbing: 'full',
    detailUrl: '/sebastian',
    bookingUrl: 'https://www.airbnb.com/rooms/29634317',
    coordinates: { lng: -91.2053, lat: 37.7238 },
    layoutPosition: { x: 60, y: 50 },
  },
  {
    id: 'multi-purpose-cafe',
    name: 'Multi-Purpose Cafe',
    type: 'unit',
    unitType: 'cafe',
    description: 'Sleeps 6 with commercial kitchen and seating for 30. Ideal for group gatherings.',
    capacity: 6,
    beds: '2 Queens + 1 Full',
    amenities: ['Commercial Kitchen', 'Full Bath', 'Seats 30', 'A/C', 'Event Space'],
    plumbing: 'full',
    detailUrl: '/dillardmill',
    bookingUrl: 'https://www.airbnb.com/rooms/44360355',
    coordinates: { lng: -91.2064, lat: 37.7235 },
    layoutPosition: { x: 45, y: 55 },
  },
  {
    id: 'tiny-cabin-1',
    name: 'Tiny Cabin #1',
    type: 'unit',
    unitType: 'tiny-cabin',
    description: 'Cozy tiny cabin with A/C and courtyard access. Shared barn bathhouse.',
    capacity: 2,
    beds: '1 Queen Bed',
    amenities: ['A/C', 'Courtyard Access', 'Shared Barn Bathhouse'],
    plumbing: 'shared-barn',
    coordinates: { lng: -91.2057, lat: 37.7232 },
    layoutPosition: { x: 50, y: 65 },
  },
  {
    id: 'tiny-cabin-2',
    name: 'Tiny Cabin #2',
    type: 'unit',
    unitType: 'tiny-cabin',
    description: 'Cozy tiny cabin with A/C and courtyard access. Shared barn bathhouse.',
    capacity: 2,
    beds: '1 Queen Bed',
    amenities: ['A/C', 'Courtyard Access', 'Shared Barn Bathhouse'],
    plumbing: 'shared-barn',
    coordinates: { lng: -91.2055, lat: 37.7230 },
    layoutPosition: { x: 55, y: 68 },
  },
  {
    id: 'the-argosy',
    name: 'The Argosy',
    type: 'unit',
    unitType: 'airstream',
    description: 'Airstream trailer sleeping 4. A/C and shared barn bathhouse access.',
    capacity: 4,
    beds: '1 Queen + 2 Twins',
    amenities: ['A/C', 'Airstream', 'Shared Barn Bathhouse'],
    plumbing: 'shared-barn',
    coordinates: { lng: -91.2050, lat: 37.7234 },
    layoutPosition: { x: 65, y: 60 },
  },
  {
    id: 'the-sherman',
    name: 'The Sherman',
    type: 'unit',
    unitType: 'airstream',
    description: 'Airstream trailer sleeping 4. A/C and shared barn bathhouse access.',
    capacity: 4,
    beds: '1 Queen + 2 Twins',
    amenities: ['A/C', 'Airstream', 'Shared Barn Bathhouse'],
    plumbing: 'shared-barn',
    coordinates: { lng: -91.2048, lat: 37.7232 },
    layoutPosition: { x: 70, y: 63 },
  },

  // === Landmarks ===
  {
    id: 'hippy-showers',
    name: 'Hippy Showers',
    type: 'landmark',
    description: 'Shared outdoor shower area for guests.',
    coordinates: { lng: -91.2059, lat: 37.7234 },
    layoutPosition: { x: 48, y: 58 },
  },
  {
    id: 'barn',
    name: 'Barn',
    type: 'landmark',
    description: 'Shared bathhouse facility with showers and restrooms.',
    coordinates: { lng: -91.2054, lat: 37.7231 },
    layoutPosition: { x: 58, y: 60 },
  },
  {
    id: 'huzzah-creek-access',
    name: 'Huzzah Creek Access',
    type: 'landmark',
    description: 'Trail access point to Huzzah Creek for swimming, fishing, and floating.',
    coordinates: { lng: -91.2075, lat: 37.7255 },
    layoutPosition: { x: 15, y: 15 },
  },
  {
    id: 'dillard-mill',
    name: 'Dillard Mill',
    type: 'landmark',
    description: 'Historic 1908 gristmill on Huzzah Creek. Walking distance from the property.',
    coordinates: { lng: -91.2082, lat: 37.7260 },
    layoutPosition: { x: 8, y: 10 },
  },
];
