import { defineType } from 'sanity';

export default defineType({
  name: 'review',
  title: 'Reviews',
  type: 'document',
  fields: [
    {
      name: 'guestName',
      title: 'Guest Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'reviewDate',
      title: 'Review Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: '1-5 stars',
      validation: (Rule) => Rule.required().min(1).max(5),
      options: {
        list: [
          { title: '⭐ 1 Star', value: 1 },
          { title: '⭐⭐ 2 Stars', value: 2 },
          { title: '⭐⭐⭐ 3 Stars', value: 3 },
          { title: '⭐⭐⭐⭐ 4 Stars', value: 4 },
          { title: '⭐⭐⭐⭐⭐ 5 Stars', value: 5 },
        ],
      },
    },
    {
      name: 'reviewText',
      title: 'Review Text',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'stayDate',
      title: 'Stay Date',
      type: 'string',
      description: 'e.g., "June 2025" or "Summer 2024"',
    },
    {
      name: 'unit',
      title: 'Rental Unit',
      type: 'reference',
      to: [{ type: 'rentalUnit' }],
      description: 'Which unit was reviewed',
    },
    {
      name: 'featured',
      title: 'Featured Review',
      type: 'boolean',
      description: 'Show on homepage',
      initialValue: false,
    },
    {
      name: 'source',
      title: 'Review Source',
      type: 'string',
      options: {
        list: [
          { title: 'Airbnb', value: 'Airbnb' },
          { title: 'VRBO', value: 'VRBO' },
          { title: 'Direct Booking', value: 'Direct' },
          { title: 'Google', value: 'Google' },
          { title: 'Facebook', value: 'Facebook' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'verified',
      title: 'Verified Review',
      type: 'boolean',
      description: 'Check if review is from actual guest',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      name: 'guestName',
      rating: 'rating',
      unit: 'unit.name',
      date: 'reviewDate',
    },
    prepare({ name, rating, unit, date }) {
      const stars = '⭐'.repeat(rating);
      return {
        title: name,
        subtitle: `${stars} - ${unit} (${date})`,
      };
    },
  },
});
