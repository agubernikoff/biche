import {defineField} from 'sanity'

export const tableType = defineField({
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional table caption',
    }),
    defineField({
      name: 'headers',
      title: 'Table Headers',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.min(1).error('At least one header is required'),
    }),
    defineField({
      name: 'rows',
      title: 'Table Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'tableRow',
          fields: [
            {
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [{type: 'string'}],
            },
          ],
          preview: {
            select: {
              cells: 'cells',
            },
            prepare({cells}) {
              return {
                title: cells ? cells.join(' | ') : 'Empty row',
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      caption: 'caption',
      headers: 'headers',
      rows: 'rows',
    },
    prepare({caption, headers, rows}) {
      const rowCount = rows ? rows.length : 0
      const colCount = headers ? headers.length : 0

      return {
        title: caption || 'Table',
        subtitle: `${rowCount} rows × ${colCount} columns`,
      }
    },
  },
})
