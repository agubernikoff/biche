import {HomeIcon} from '@sanity/icons'
import {defineArrayMember, defineField} from 'sanity'
import {GROUPS} from '../../constants'

const TITLE = 'Home'

export const homeType = defineField({
  name: 'home',
  title: TITLE,
  type: 'document',
  icon: HomeIcon,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'hero',
      type: 'hero',
      group: 'editorial',
    }),
    defineField({
      name: 'firstSection',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'heroTitle',
          title: 'Hero Title',
          type: 'string',
        },
        {
          name: 'introText',
          title: 'Intro Text',
          type: 'portableTextSimple',
        },
        {
          name: 'mainImage',
          title: 'Main Image',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            },
            {
              name: 'altText',
              title: 'Alt Text',
              type: 'string',
            },
            {name: 'link', type: 'linkInternal'},
          ],
        },
        {
          name: 'secondaryImage',
          title: 'Secondary Image',
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {hotspot: true},
            },
            {
              name: 'altText',
              title: 'Alt Text',
              type: 'string',
            },
            {name: 'link', type: 'linkInternal'},
          ],
        },
      ],
    }),
    defineField({
      name: 'ourStandards',
      title: 'Our Standards',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'cards',
          title: 'Cards',
          type: 'array',
          validation: (Rule) => Rule.length(3).error('Must have exactly 3 cards'),
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: {
                    hotspot: true,
                  },
                }),
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
                defineField({
                  name: 'link',
                  type: 'linkInternal',
                  description:
                    'Optional link for the card image. If not set, the card image will not be clickable.',
                }),
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'bottomSection',
      type: 'object',
      group: 'editorial',
      fields: [
        {
          name: 'bannerImage',
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
        {
          name: 'blurb',
          type: 'portableTextSimple',
        },
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
