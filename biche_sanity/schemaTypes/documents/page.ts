import {DocumentIcon} from '@sanity/icons'
import {defineField, defineArrayMember} from 'sanity'

import {validateSlug} from '../../utils/validateSlug'
import { GROUPS } from '../../constants'

export const pageType = defineField({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'hasSideNav',
      type: 'boolean',
      initialValue: false,
      group: 'editorial',
    }),
    defineField({
      name: 'title',
      group: 'editorial',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      group: 'editorial',
      type: 'slug',
      options: {source: 'title'},
      validation: validateSlug,
    }),
    defineField({
      name: 'subheader',
      group: 'editorial',
      type: 'text',
    }),
    defineField({
      name: 'dividerSections',
      type: 'array',
      group: 'editorial',
      of: [
        defineArrayMember({
          name: 'dividerSection',
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Section Title'
            },
            {
              name: 'content',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'contentItem',
                  type: 'object',
                  fields: [
                    {
                      name: 'title',
                      type: 'string'
                    },
                    {
                      name: 'body',
                      type: 'portableTextSimple',
                    },
                    {
                      name: 'email',
                      type: 'linkEmail'
                    }
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      body: 'body'
                    },
                    prepare({title, body}) {
                      return {
                        title: title || (body && body[0]?.children?.[0]?.text) || 'Untitled Content'
                      }
                    }
                  }
                }),
              ]
            }
          ],
          preview: {
            select: {
              title: 'title',
              contentCount: 'content'
            },
            prepare({title, contentCount}) {
              const count = contentCount ? contentCount.length : 0;
              return {
                title: title || 'Untitled Section',
                subtitle: `${count} content item${count !== 1 ? 's' : ''}`
              }
            }
          }
        })
      ]
    }),
    defineField({
      name: 'colorTheme',
      type: 'reference',
      to: [{type: 'colorTheme'}],
      group: 'theme',
    }),
    defineField({
      name: 'showHero',
      type: 'boolean',
      description: 'If disabled, page title will be displayed instead',
      initialValue: false,
      group: 'editorial',
    }),
    defineField({
      name: 'hero',
      type: 'hero',
      hidden: ({document}) => !document?.showHero,
      group: 'editorial',
    }),
    defineField({
      name: 'body',
      type: 'portableText',
      group: 'editorial',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      seoImage: 'seo.image',
      title: 'title',
    },
    prepare({seoImage, title}) {
      return {
        media: seoImage ?? DocumentIcon,
        title,
      }
    },
  },
})