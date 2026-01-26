import { defineType } from 'sanity';

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom page title for search engines (max 60 chars)',
      validation: (Rule) => Rule.max(60),
    },
    {
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      description: 'Meta description for search engines (max 160 chars)',
      validation: (Rule) => Rule.max(160),
    },
    {
      name: 'image',
      title: 'Social Share Image',
      type: 'image',
      description: 'Image for social media sharing (1200x630px recommended)',
    },
  ],
});
