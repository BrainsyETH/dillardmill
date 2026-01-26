import { client } from './client';
import type { RentalUnit, Review, Attraction, BlogPost, SiteSettings } from './schemas';

// Rental Units
export async function getAllUnits(): Promise<RentalUnit[]> {
  return client.fetch(
    `*[_type == "rentalUnit" && available == true] | order(featured desc, sortOrder asc, _createdAt desc) {
      _id,
      name,
      slug,
      shortDescription,
      basePrice,
      cleaningFee,
      bedrooms,
      bathrooms,
      maxGuests,
      "featuredImage": images[featured == true][0],
      amenities[]->{
        name,
        icon
      },
      featured
    }`
  );
}

export async function getUnitBySlug(slug: string): Promise<RentalUnit | null> {
  return client.fetch(
    `*[_type == "rentalUnit" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      shortDescription,
      basePrice,
      seasonalPricing,
      cleaningFee,
      minStay,
      maxGuests,
      bedrooms,
      bathrooms,
      beds,
      amenities[]->{
        _id,
        name,
        icon,
        category,
        description
      },
      images,
      virtualTourUrl,
      videoUrl,
      airbnbUrl,
      vrboUrl,
      bookingUrl,
      seo,
      available
    }`,
    { slug }
  );
}

// Gallery
export async function getAllGalleryImages() {
  return client.fetch(
    `*[_type == "rentalUnit"] {
      "unitName": name,
      "unitSlug": slug.current,
      "images": images[] {
        image,
        caption,
        alt,
        featured
      }
    }`
  );
}

// Reviews
export async function getReviews(limit?: number): Promise<Review[]> {
  const limitClause = limit ? `[0...${limit}]` : '';
  return client.fetch(
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
    }`
  );
}

export async function getFeaturedReviews(): Promise<Review[]> {
  return client.fetch(
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
    }`
  );
}

// Attractions
export async function getAttractions(): Promise<Attraction[]> {
  return client.fetch(
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
    }`
  );
}

export async function getAttractionBySlug(slug: string): Promise<Attraction | null> {
  return client.fetch(
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
    { slug }
  );
}

// Blog
export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const limitClause = limit ? `[0...${limit}]` : '';
  return client.fetch(
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
    }`
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return client.fetch(
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
    { slug }
  );
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings> {
  return client.fetch(
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
    }`
  );
}
