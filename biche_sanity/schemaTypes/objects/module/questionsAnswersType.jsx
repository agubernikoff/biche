import {defineArrayMember, defineField} from 'sanity'

// Define the Q&A object type
export const qaObjectType = defineField({
  name: 'qaObject',
  title: 'Question & Answer',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required().min(10).max(500),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'portableTextSimple',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      question: 'question',
    },
    prepare({question}) {
      return {
        title: question || 'Untitled Question',
        subtitle: 'Q&A',
      }
    },
  },
})

// Main Questions & Answers document type
export const questionsAnswersType = defineField({
  name: 'questionsAnswers',
  title: 'Questions & Answers',
  type: 'document',
  icon: () => '❔',
  fields: [
    defineField({
      name: 'owner',
      title: 'Owner Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'dog',
      title: 'Dog Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(50),
    }),
    defineField({
      name: 'questionsForYou',
      title: 'Questions for You',
      type: 'array',
      of: [defineArrayMember({type: 'qaObject'})],
      validation: (Rule) => [
        Rule.required().min(1).error('At least one question for the owner is required'),
        Rule.custom((questionsForYou, context) => {
          const questionsForYourDog = context.document?.questionsForYourDog

          if (!questionsForYou || !questionsForYourDog) {
            return true // Let other validations handle required fields
          }

          if (questionsForYou.length !== questionsForYourDog.length) {
            return `Questions for You (${questionsForYou.length}) must match Questions for Your Dog (${questionsForYourDog.length})`
          }

          return true
        }),
      ],
    }),
    defineField({
      name: 'questionsForYourDog',
      title: 'Questions for Your Dog',
      type: 'array',
      of: [defineArrayMember({type: 'qaObject'})],
      validation: (Rule) => [
        Rule.required().min(1).error('At least one question for the dog is required'),
        Rule.custom((questionsForYourDog, context) => {
          const questionsForYou = context.document?.questionsForYou

          if (!questionsForYou || !questionsForYourDog) {
            return true // Let other validations handle required fields
          }

          if (questionsForYourDog.length !== questionsForYou.length) {
            return `Questions for Your Dog (${questionsForYourDog.length}) must match Questions for You (${questionsForYou.length})`
          }

          return true
        }),
      ],
    }),
  ],
  preview: {
    select: {
      owner: 'owner',
      dog: 'dog',
      questionsForYou: 'questionsForYou',
      questionsForYourDog: 'questionsForYourDog',
    },
    prepare({owner, dog, questionsForYou, questionsForYourDog}) {
      const youCount = questionsForYou ? questionsForYou.length : 0
      const dogCount = questionsForYourDog ? questionsForYourDog.length : 0

      return {
        title: `${owner} & ${dog}`,
        subtitle: `${youCount} owner questions, ${dogCount} dog questions`,
        media: () => '🐕', // You can replace with an icon
      }
    },
  },
  // Document-level validation for extra safety
  validation: (Rule) =>
    Rule.custom((doc) => {
      if (!doc?.questionsForYou || !doc?.questionsForYourDog) {
        return true
      }

      if (doc.questionsForYou.length !== doc.questionsForYourDog.length) {
        return 'The number of questions for the owner and dog must be equal'
      }

      return true
    }),
})
