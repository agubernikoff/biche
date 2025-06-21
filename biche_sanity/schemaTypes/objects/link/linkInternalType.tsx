import {LinkIcon} from '@sanity/icons'
import {defineField} from 'sanity'
import {PAGE_REFERENCES} from '../../../constants'

export const linkInternalType = defineField({
  title: 'Internal Link',
  name: 'linkInternal',
  type: 'object',
  icon: LinkIcon,
  components: {
    annotation: (props) => (
      <span style={{textDecoration: 'underline'}}>
        {props.renderDefault(props)}
      </span>
    ),
  },
  preview: {
    select: {
      title: 'reference.title',
      slug: 'reference.slug.current',
      type: 'reference._type',
    },
    prepare({title, slug, type}) {
      return {
        title: title || 'Untitled',
        subtitle: slug ? `${slug}` : `${type || 'Unknown type'}`,
        media: LinkIcon,
      }
    },
  },
  fields: [
    defineField({
      name: 'reference',
      type: 'reference',
      weak: true,
      validation: (Rule) => Rule.required(),
      to: PAGE_REFERENCES,
    }),
  ],
})