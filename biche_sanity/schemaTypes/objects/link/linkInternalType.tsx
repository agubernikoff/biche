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
      manualPath: 'path',
      manualTitle: 'title',
    },
    prepare({title, slug, type, manualPath, manualTitle}) {
      // Use reference data if available, otherwise use manual fields
      const displayTitle = title || manualTitle || 'Untitled'
      const displaySubtitle = slug ? `${slug}` : manualPath || `${type || 'Unknown type'}`
      
      return {
        title: displayTitle,
        subtitle: displaySubtitle,
        media: LinkIcon,
      }
    },
  },
  fields: [
    defineField({
      name: 'reference',
      type: 'reference',
      weak: true,
      to: PAGE_REFERENCES,
      validation: (Rule) => Rule.custom((reference, context) => {
        const path = context.parent?.path
        if (!reference && !path) {
          return 'Either select a page reference or enter a manual path'
        }
        return true
      }),
    }),
    defineField({
      name: 'path',
      type: 'string',
      title: 'Manual Path',
      description: 'Use this for pages without references (e.g., /about, /contact)',
      placeholder: '/path/to/page',
      validation: (Rule) => Rule.custom((path, context) => {
        const reference = context.parent?.reference
        if (!reference && !path) {
          return 'Either select a page reference or enter a manual path'
        }
        if (path && !path.startsWith('/')) {
          return 'Path should start with /'
        }
        return true
      }),
      hidden: ({parent}) => !!parent?.reference,
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Link Title',
      description: 'Required title for manual paths',
      validation: (Rule) => Rule.custom((title, context) => {
        const path = context.parent?.path
        const reference = context.parent?.reference
        if (!reference && path && !title) {
          return 'Title is required when using manual path'
        }
        return true
      }),
      hidden: ({parent}) => !!parent?.reference,
    }),
  ],
})