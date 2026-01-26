import { defineType } from 'sanity';

export default defineType({
  name: 'attractionCategory',
  title: 'Attraction Categories',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
});
