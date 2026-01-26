import { defineType } from 'sanity';

export default defineType({
  name: 'amenity',
  title: 'Amenities',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Amenity Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Name of the icon to use (e.g., "wifi", "hot-tub", "fire-pit")',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Indoor', value: 'indoor' },
          { title: 'Outdoor', value: 'outdoor' },
          { title: 'General', value: 'general' },
          { title: 'Safety', value: 'safety' },
          { title: 'Kitchen', value: 'kitchen' },
          { title: 'Entertainment', value: 'entertainment' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
});
