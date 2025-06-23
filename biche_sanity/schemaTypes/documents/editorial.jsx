import {DocumentsIcon} from '@sanity/icons'
import {defineField, defineArrayMember} from 'sanity'

import {validateSlug} from '../../utils/validateSlug'
import {GROUPS} from '../../constants'

export const editorialType = defineField({
  name: 'editorial',
  title: 'Editorial',
  type: 'document',
  icon: DocumentsIcon,
  groups: GROUPS,
  fields: [
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
      options: {
        source: 'title',
      },
      validation: validateSlug,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'editorial',
      options: {
        list: [{title: 'Off-Leash', value: 'Off-Leash'}],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'author',
      type: 'object',
      group: 'editorial',
      fields: [
        {name: 'name', type: 'string', initialValue: 'The Biche Team'},
        {name: 'link', type: 'linkExternal'},
      ],
    }),
    defineField({
      name: 'hero',
      type: 'image',
      options: {withHotSpot: true},
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
      title: 'title',
      heroImage: 'hero',
    },
    prepare({heroImage, title}) {
      return {
        media: heroImage,
        title,
      }
    },
  },
})
