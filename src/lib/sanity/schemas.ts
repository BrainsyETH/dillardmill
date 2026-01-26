import type { PortableTextBlock } from '@portabletext/react';
import type { SanityImageSource } from '@sanity/image-url';

// Common Types
export interface Slug {
  _type: 'slug';
  current: string;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

export interface SEO {
  title?: string;
  description?: string;
  image?: SanityImage;
}

// Rental Unit Types
export interface BedConfiguration {
  type: string;
  count: number;
}

export interface SeasonalPricing {
  season: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
}

export interface ImageWithCaption {
  image: SanityImage;
  caption?: string;
  alt?: string;
  featured?: boolean;
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
  slug: Slug;
  description?: PortableTextBlock[];
  shortDescription?: string;
  basePrice: number;
  seasonalPricing?: SeasonalPricing[];
  cleaningFee?: number;
  minStay?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds?: BedConfiguration[];
  amenities?: Amenity[];
  images?: ImageWithCaption[];
  featuredImage?: ImageWithCaption;
  virtualTourUrl?: string;
  videoUrl?: string;
  airbnbUrl?: string;
  vrboUrl?: string;
  bookingUrl?: string;
  seo?: SEO;
  available: boolean;
  featured?: boolean;
  sortOrder?: number;
}

// Review Types
export interface Review {
  _id: string;
  guestName: string;
  reviewDate: string;
  rating: number;
  reviewText: string;
  stayDate?: string;
  unit?: {
    name: string;
    slug: Slug;
  };
  featured: boolean;
  source: string;
  verified: boolean;
}

// Attraction Types
export interface Location {
  lat: number;
  lng: number;
}

export interface Attraction {
  _id: string;
  name: string;
  slug: Slug;
  category?: {
    name: string;
  };
  description?: PortableTextBlock[];
  address?: string;
  distance?: string;
  website?: string;
  phone?: string;
  images?: SanityImage[];
  location?: Location;
}

// Blog Types
export interface Author {
  name: string;
  image?: SanityImage;
  bio?: PortableTextBlock[];
}

export interface Category {
  name: string;
  slug: Slug;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: Slug;
  author?: Author;
  categories?: Category[];
  publishedAt: string;
  excerpt?: string;
  coverImage?: SanityImage;
  body?: PortableTextBlock[];
  seo?: SEO;
}

// Site Settings Types
export interface NavigationItem {
  label: string;
  url: string;
  subMenu?: NavigationItem[];
}

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    url: string;
  }>;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logo?: SanityImage;
  email: string;
  phone?: string;
  address?: string;
  navigation?: NavigationItem[];
  footer?: {
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    copyrightText?: string;
  };
  bookingNotice?: string;
  airbnbProfileUrl?: string;
  vrboProfileUrl?: string;
  seo?: SEO;
}
