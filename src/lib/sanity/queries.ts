import { client, sanityConfigured } from "./client";
import type {
  RentalUnit,
  Review,
  Attraction,
  BlogPost,
  SiteSettings,
} from "./schemas";

import { publishedUnits } from "@/lib/content/property";

async function displayFetch<T>(
  query: string,
  params: Record<string, string> = {},
  fallback: T,
): Promise<T> {
  if (!sanityConfigured) return fallback;
  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.error("Content unavailable", error);
    return fallback;
  }
}

// Rental Units
export async function getAllUnits(): Promise<RentalUnit[]> {
  return displayFetch(
    `*[_type == "rentalUnit" && available == true] | order(featured desc, sortOrder asc) {
  ..., amenities[]->{_id, name, icon, category, description},
  "featuredImage": coalesce(images[featured == true][0], images[0]),
  "directBookingEnabled": coalesce(directBookingEnabled, true)
 }`,
    {},
    publishedUnits,
  );
}
export async function getUnitBySlug(slug: string): Promise<RentalUnit | null> {
  return displayFetch(
    `*[_type == "rentalUnit" && slug.current == $slug && available == true][0] {
  ..., amenities[]->{_id, name, icon, category, description},
  "directBookingEnabled": coalesce(directBookingEnabled, true)
 }`,
    { slug },
    publishedUnits.find((u) => u.slug.current === slug) || null,
  );
}

// Gallery
export async function getAllGalleryImages() {
  return displayFetch(
    `*[_type == "rentalUnit"] {
      "unitName": name,
      "unitSlug": slug.current,
      "images": images[] {
        image,
        caption,
        alt,
        featured
      }
    }`,
    {},
    [],
  );
}

// Reviews
export async function getReviews(limit?: number): Promise<Review[]> {
  const limitClause = limit ? `[0...${limit}]` : "";
  return displayFetch(
    `*[_type == "review" && verified == true] | order(reviewDate desc) ${limitClause} {
      _id,
      guestName,
      reviewDate,
      rating,
      reviewText,
      stayDate,
      unit->{
        name,
        slug
      },
      featured,
      source
    }`,
    {},
    [],
  );
}

export async function getFeaturedReviews(): Promise<Review[]> {
  return displayFetch(
    `*[_type == "review" && featured == true && verified == true] | order(reviewDate desc) [0...6] {
      _id,
      guestName,
      reviewDate,
      rating,
      reviewText,
      stayDate,
      unit->{
        name,
        slug
      },
      source
    }`,
    {},
    [],
  );
}

// Attractions
export async function getAttractions(): Promise<Attraction[]> {
  return displayFetch(
    `*[_type == "attraction"] | order(distance asc) {
      _id,
      name,
      slug,
      category->{
        name
      },
      description,
      address,
      distance,
      website,
      phone,
      images,
      location
    }`,
    {},
    [],
  );
}

export async function getAttractionBySlug(
  slug: string,
): Promise<Attraction | null> {
  return displayFetch(
    `*[_type == "attraction" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      category->{
        name
      },
      description,
      address,
      distance,
      website,
      phone,
      images,
      location
    }`,
    { slug },
    null,
  );
}

// Blog
export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const limitClause = limit ? `[0...${limit}]` : "";
  return displayFetch(
    `*[_type == "blogPost"] | order(publishedAt desc) ${limitClause} {
      _id,
      title,
      slug,
      author->{
        name,
        image
      },
      categories[]->{
        name,
        slug
      },
      publishedAt,
      excerpt,
      coverImage
    }`,
    {},
    [],
  );
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  return displayFetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      author->{
        name,
        image,
        bio
      },
      categories[]->{
        name,
        slug
      },
      publishedAt,
      excerpt,
      coverImage,
      body,
      seo
    }`,
    { slug },
    null,
  );
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  return displayFetch(
    `*[_type == "siteSettings"][0] {
      siteName,
      tagline,
      logo,
      email,
      phone,
      address,
      navigation,
      footer,
      bookingNotice,
      airbnbProfileUrl,
      vrboProfileUrl,
      seo
    }`,
    {},
    {
      siteName: "Pine Valley at Dillard Mill",
      email: "pinevalley@dillardmill.com",
      phone: "(314) 843-4321",
    },
  );
}
