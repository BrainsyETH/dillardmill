import { defineConfig } from 'sanity';
import { structureTool, type StructureBuilder } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'Dillard Mill - Pine Valley Airbnb',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Content')
          .items([
            // Singleton for site settings
            S.listItem()
              .title('Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),

            // Rental Units
            S.listItem()
              .title('Rental Units')
              .schemaType('rentalUnit')
              .child(S.documentTypeList('rentalUnit').title('Rental Units')),

            // Amenities
            S.listItem()
              .title('Amenities')
              .schemaType('amenity')
              .child(S.documentTypeList('amenity').title('Amenities')),

            S.divider(),

            // Reviews
            S.listItem()
              .title('Reviews')
              .schemaType('review')
              .child(S.documentTypeList('review').title('Reviews')),

            S.divider(),

            // Local Attractions
            S.listItem()
              .title('Local Attractions')
              .schemaType('attraction')
              .child(S.documentTypeList('attraction').title('Attractions')),

            S.listItem()
              .title('Attraction Categories')
              .schemaType('attractionCategory')
              .child(S.documentTypeList('attractionCategory').title('Categories')),

            S.divider(),

            // Blog
            S.listItem()
              .title('Blog Posts')
              .schemaType('blogPost')
              .child(S.documentTypeList('blogPost').title('Blog Posts')),

            S.listItem()
              .title('Blog Categories')
              .schemaType('blogCategory')
              .child(S.documentTypeList('blogCategory').title('Categories')),

            S.listItem()
              .title('Authors')
              .schemaType('author')
              .child(S.documentTypeList('author').title('Authors')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
