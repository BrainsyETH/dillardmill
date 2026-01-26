import { defineType } from 'sanity';

export default defineType({
  name: 'seasonalPricing',
  title: 'Seasonal Pricing',
  type: 'object',
  fields: [
    {
      name: 'season',
      title: 'Season Name',
      type: 'string',
      description: 'e.g., "Summer Peak", "Winter", "Holiday Season"',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'pricePerNight',
      title: 'Price Per Night',
      type: 'number',
      description: 'Nightly rate for this season',
      validation: (Rule) => Rule.required().positive(),
    },
  ],
  preview: {
    select: {
      season: 'season',
      price: 'pricePerNight',
      start: 'startDate',
      end: 'endDate',
    },
    prepare({ season, price, start, end }) {
      return {
        title: season,
        subtitle: `$${price}/night (${start} - ${end})`,
      };
    },
  },
});
