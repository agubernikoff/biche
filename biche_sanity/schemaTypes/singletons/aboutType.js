import {HomeIcon, MenuIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'

import {validateSlug} from '../../utils/validateSlug'
import {GROUPS} from '../../constants'

const TITLE = 'About'

export const aboutType = defineField({
  name: 'about',
  title: TITLE,
  type: 'document',
  icon: HomeIcon,
  groups: [
    ...GROUPS,
    {
      name: 'navigation',
      title: 'Navigation',
      icon: MenuIcon,
    },
  ],
  fields: [
    defineField({
      name: 'title',
      group: 'navigation',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      group: 'navigation',
      type: 'slug',
      options: {
        source: 'title',
        slugify: (input) => {
          const baseSlug = input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')

          return `/${baseSlug}`
        },
      },
      validation: validateSlug,
    }),
    defineField({
      name: 'hero',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'image',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'blurb',
          title: 'Short Blurb',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'quoteAndImage',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'quote',
          title: 'Quote',
          type: 'text',
        },
        {
          name: 'quotee',
          title: 'Quotee',
          type: 'string',
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
        },
      ],
    }),
    defineField({
      name: 'imageAndCopy',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          description: 'If left empty, will fall back to logo',
        },
        {
          name: 'blurb',
          type: 'portableTextSimple',
        },
      ],
    }),
    defineField({
      name: 'ourStandards',
      type: 'object',
      group: 'editorial',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        {
          name: 'blurb',
          type: 'portableTextSimple',
        },
        {
          name: 'squareImages',
          type: 'array',
          description: 'Aspect ratio will be coerced to 1/1',
          validation: (Rule) => Rule.length(2).error('Must have exactly 2 images'),
          of: [
            defineArrayMember({
              name: 'image',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
          ],
        },
        {
          name: 'primaryImage',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'ourTeam',
      type: 'object',
      group: 'editorial',
      fields: [
        {name: 'title', type: 'string'},
        defineField({
          name: 'ourTeam',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'teamMember',
              type: 'object',
              fields: [
                {name: 'name', type: 'string'},
                {name: 'title', type: 'string'},
                {
                  name: 'petInfo',
                  type: 'string',
                },
                {
                  name: 'shortBio',
                  type: 'text',
                },
                {name: 'image', type: 'image'},
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'title',
                  media: 'image',
                },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [
        defineArrayMember({type: 'accordion'}),
        defineArrayMember({type: 'callout'}),
        defineArrayMember({type: 'grid'}),
        defineArrayMember({type: 'images'}),
        defineArrayMember({type: 'imageWithProductHotspots', title: 'Image with Hotspots'}),
        defineArrayMember({type: 'instagram'}),
        defineArrayMember({type: 'products'}),
      ],
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
    prepare() {
      return {
        media: HomeIcon,
        subtitle: 'Index',
        title: TITLE,
      }
    },
  },
})
