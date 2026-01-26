import { defineType } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Authors',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
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
    },
    {
      name: 'image',
      title: 'Profile Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
});
