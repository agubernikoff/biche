import {defineArrayMember, defineField} from 'sanity'

export const footerType = defineField({
  name: 'footerSettings',
  title: 'Footer',
  type: 'object',
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: 'linkColumns',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'linkColumn',
          type: 'object',
          title: 'Link Column',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Column Title',
            }),
            defineField({
              name: 'links',
              type: 'array',
              title: 'Links',
              of: [
                {type: 'linkInternal'}, 
                {type: 'linkExternal'}
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              links: 'links',
            },
            prepare({title, links}) {
              return {
                title: title || 'Untitled Column',
                subtitle: `${links.length || 0} link${links.length !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'newsletter',
      type: 'object',
      fields:[
        {
          name:'title',
          type:'string'
        },
        {
          name: 'placeholder',
          type:'string'
        },
        {
          name:'submitText',
          type:'string'
        },
        {
          name:'successMessage',
        type:'string'
        }
      ]
    }),
  ],
})
