// Object types
import seo from './objects/seo';
import imageWithCaption from './objects/imageWithCaption';
import seasonalPricing from './objects/seasonalPricing';
import bedConfiguration from './objects/bedConfiguration';

// Document types
import rentalUnit from './documents/rentalUnit';
import amenity from './documents/amenity';
import review from './documents/review';
import attraction from './documents/attraction';
import attractionCategory from './documents/attractionCategory';
import blogPost from './documents/blogPost';
import author from './documents/author';
import blogCategory from './documents/blogCategory';
import siteSettings from './documents/siteSettings';

export const schemaTypes = [
  // Objects
  seo,
  imageWithCaption,
  seasonalPricing,
  bedConfiguration,

  // Documents
  rentalUnit,
  amenity,
  review,
  attraction,
  attractionCategory,
  blogPost,
  author,
  blogCategory,
  siteSettings,
];
