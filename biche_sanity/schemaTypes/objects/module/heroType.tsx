import {defineArrayMember, defineField} from 'sanity'

export const heroType = defineField({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    {
      name: 'leftImage',
      title: 'Left Image',
      type: 'image',
      options: {hotspot: true},
    },
    {
      name: 'rightImage',
      title: 'Right Image',
      type: 'image',
      options: {hotspot: true},
    },
    // defineField({
    //   name: 'title',
    //   type: 'text',
    //   rows: 3,
    // }),
    // defineField({
    //   name: 'description',
    //   type: 'text',
    //   rows: 3,
    // }),
    // defineField({
    //   name: 'link',
    //   type: 'array',
    //   of: [{type: 'linkInternal'}, {type: 'linkExternal'}],
    //   validation: (Rule) => Rule.max(1),
    // }),
    // defineField({
    //   name: 'content',
    //   type: 'array',
    //   // validation: (Rule) => Rule.max(1),
    //   of: [
    //     // defineArrayMember({
    //     //   name: 'productWithVariant',
    //     //   type: 'productWithVariant',
    //     // }),
    //     defineArrayMember({
    //       name: 'imageWithProductHotspots',
    //       type: 'imageWithProductHotspots',
    //     }),
    //   ],
    // }),
  ],
})
