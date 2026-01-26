import { defineType } from 'sanity';

export default defineType({
  name: 'imageWithCaption',
  title: 'Image with Caption',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Alternative text for accessibility',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'featured',
      title: 'Featured Image',
      type: 'boolean',
      description: 'Use as the main image for this unit',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      media: 'image',
      title: 'alt',
      subtitle: 'caption',
    },
  },
});
