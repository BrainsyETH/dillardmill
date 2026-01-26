import { defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Brief site description',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    },
    {
      name: 'navigation',
      title: 'Main Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Label',
            },
            {
              name: 'url',
              type: 'string',
              title: 'URL',
            },
          ],
        },
      ],
    },
    {
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Column Title',
            },
            {
              name: 'links',
              type: 'array',
              title: 'Links',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      type: 'string',
                      title: 'Label',
                    },
                    {
                      name: 'url',
                      type: 'string',
                      title: 'URL',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              title: 'Platform',
              options: {
                list: ['Facebook', 'Instagram', 'Twitter', 'YouTube', 'TikTok'],
              },
            },
            {
              name: 'url',
              type: 'url',
              title: 'Profile URL',
            },
          ],
        },
      ],
    },
    {
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
    },
    {
      name: 'bookingNotice',
      title: 'Booking Notice',
      type: 'text',
      rows: 3,
      description: 'Message about how to book (shown on booking pages)',
    },
    {
      name: 'airbnbProfileUrl',
      title: 'Airbnb Profile URL',
      type: 'url',
    },
    {
      name: 'vrboProfileUrl',
      title: 'VRBO Profile URL',
      type: 'url',
    },
    {
      name: 'seo',
      title: 'Default SEO Settings',
      type: 'seo',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});
