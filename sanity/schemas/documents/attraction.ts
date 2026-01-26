import { defineType } from 'sanity';

export default defineType({
  name: 'attraction',
  title: 'Local Attractions',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Attraction Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'attractionCategory' }],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
    },
    {
      name: 'distance',
      title: 'Distance from Property',
      type: 'string',
      description: 'e.g., "0.1 miles", "5 min walk", "10 min drive"',
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
          ],
        },
      ],
    },
    {
      name: 'location',
      title: 'Map Location',
      type: 'object',
      fields: [
        {
          name: 'lat',
          title: 'Latitude',
          type: 'number',
        },
        {
          name: 'lng',
          title: 'Longitude',
          type: 'number',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'distance',
      media: 'images.0',
    },
  },
});
