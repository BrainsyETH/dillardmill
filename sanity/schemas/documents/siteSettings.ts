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
      name: 'taxRates',
      title: 'Taxes Collected on Direct Bookings',
      type: 'array',
      description:
        'Each tax is applied to the stay subtotal (nightly rate, guest and pet fees, cleaning). Leave empty to collect no tax.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Name shown to guests', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'ratePercent',
              title: 'Rate (%)',
              type: 'number',
              description: 'e.g. 4.225 for 4.225%',
              validation: (Rule) => Rule.required().min(0).max(30),
            },
          ],
          preview: {
            select: { name: 'name', rate: 'ratePercent' },
            prepare: ({ name, rate }: { name?: string; rate?: number }) => ({ title: `${name ?? 'Tax'} — ${rate ?? 0}%` }),
          },
        },
      ],
    },
    {
      name: 'cancellationPolicy',
      title: 'Cancellation Policy',
      type: 'text',
      rows: 5,
      description: 'Shown at checkout; guests must accept it before requesting a booking.',
    },
    {
      name: 'houseRules',
      title: 'House Rules',
      type: 'text',
      rows: 6,
      description: 'Shown at checkout; guests must accept them before requesting a booking.',
    },
    { name: 'checkInTime', title: 'Check-in Time', type: 'string', description: 'e.g. 3:00 PM' },
    { name: 'checkOutTime', title: 'Check-out Time', type: 'string', description: 'e.g. 11:00 AM' },
    {
      name: 'requestResponseHours',
      title: 'Hours to Respond to Booking Requests',
      type: 'number',
      description:
        'Requests not approved within this window are declined automatically and the card hold is released. Maximum 144 (6 days; card holds expire after 7).',
      initialValue: 24,
      validation: (Rule) => Rule.min(1).max(144).integer(),
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
