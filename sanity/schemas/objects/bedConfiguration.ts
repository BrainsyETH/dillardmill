import { defineType } from 'sanity';

export default defineType({
  name: 'bedConfiguration',
  title: 'Bed Configuration',
  type: 'object',
  fields: [
    {
      name: 'type',
      title: 'Bed Type',
      type: 'string',
      options: {
        list: [
          { title: 'King', value: 'King' },
          { title: 'Queen', value: 'Queen' },
          { title: 'Full/Double', value: 'Full' },
          { title: 'Twin', value: 'Twin' },
          { title: 'Bunk Bed', value: 'Bunk' },
          { title: 'Sofa Bed', value: 'Sofa' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'count',
      title: 'Number of Beds',
      type: 'number',
      validation: (Rule) => Rule.required().positive().integer(),
      initialValue: 1,
    },
  ],
  preview: {
    select: {
      type: 'type',
      count: 'count',
    },
    prepare({ type, count }) {
      return {
        title: `${count} ${type} ${count > 1 ? 'beds' : 'bed'}`,
      };
    },
  },
});
