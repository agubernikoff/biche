import {ListItemBuilder, StructureResolver} from 'sanity/structure';
import collections from './collectionStructure'
import colorThemes from './colorThemeStructure'
import home from './homeStructure'
import pages from './pageStructure'
import products from './productStructure'
import settings from './settingStructure'
import about from './aboutStructure'

/**
 * Structure overrides
 *
 * Sanity Studio automatically lists document types out of the box.
 * With this custom structure we achieve things like showing the `home`
 * and `settings` document types as singletons, and grouping product details
 * and variants for easy editorial access.
 *
 * You can customize this even further as your schema types progress.
 * To learn more about structure builder, visit our docs:
 * https://www.sanity.io/docs/overview-structure-builder
 */

// If you add document types to structure manually, you can add them to this function to prevent duplicates in the root pane
const hiddenDocTypes = (listItem: ListItemBuilder) => {
  const id = listItem.getId()

  if (!id) {
    return false
  }

  return ![
    'collection',
    'colorTheme',
    'home',
    'media.tag',
    'page',
    'product',
    'productVariant',
    'settings',
    'about',
    'questionsAnswers'
  ].includes(id)
}

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      home(S, context),
      S.divider(),
      about(S, context),
      S.divider(),
      pages(S, context),
      S.divider(),
      collections(S, context),
      products(S, context),
      S.divider(),
      colorThemes(S, context),
      S.divider(),
      settings(S, context),
      S.divider(),
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ])
