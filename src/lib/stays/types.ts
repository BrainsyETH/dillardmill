// Display model for a stay: business fields from Postgres merged with the
// descriptive content in src/lib/content/property.ts.

export interface BedConfiguration {
  type: string;
  count: number;
}

export interface SeasonalPricing {
  season: string;
  startDate: string;
  endDate: string;
  pricePerNight: number; // dollars
}

export interface Amenity {
  _id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
}

export interface RentalUnit {
  _id: string;
  name: string;
  slug: { _type: "slug"; current: string };
  shortDescription?: string;
  basePrice: number; // dollars; 0 = not priced online
  seasonalPricing?: SeasonalPricing[];
  cleaningFee?: number;
  baseGuests?: number;
  extraGuestFee?: number;
  petsAllowed?: boolean;
  maxPets?: number;
  petFee?: number;
  minStay?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds?: BedConfiguration[];
  amenities?: Amenity[];
  airbnbUrl?: string;
  hipcampUrl?: string;
  vrboUrl?: string;
  directBookingEnabled?: boolean;
  isWholeProperty?: boolean;
  available: boolean;
  sortOrder?: number;
}

export interface Review {
  _id: string;
  guestName: string;
  reviewDate: string;
  rating: number;
  reviewText: string;
  unit?: { name: string; slug: { current: string } };
  source: string;
}
