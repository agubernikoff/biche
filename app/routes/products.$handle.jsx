import {useLoaderData} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useState} from 'react';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  if (!data?.product) {
    return [{title: 'Biche'}];
  }

  return [
    {title: `Biche ${data.product.title}`},
    {
      rel: 'canonical',
      href: `/products/${data.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

function ProductDropdown({title, content, isOpen, onToggle}) {
  return (
    <div className="product-dropdown">
      <button className="product-dropdown-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="product-dropdown-icon">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div
          className="product-dropdown-content"
          dangerouslySetInnerHTML={{__html: content}}
        />
      )}
    </div>
  );
}

function parseRichText(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    const renderNode = (node) => {
      if (node.type === 'root') {
        return node.children.map(renderNode).join('');
      }

      if (node.type === 'paragraph') {
        const content = node.children
          .map((child) => {
            if (child.type === 'text') {
              let text = child.value;
              // Convert line breaks to <br> tags
              text = text.replace(/\n/g, '<br>');
              if (child.bold) text = `<strong>${text}</strong>`;
              if (child.italic) text = `<em>${text}</em>`;
              return text;
            }
            return '';
          })
          .join('');
        return `<p>${content}</p>`;
      }

      if (node.type === 'list') {
        const listType = node.listType === 'ordered' ? 'ol' : 'ul';
        const items = node.children
          .map((item) => {
            const content = item.children
              .map((child) => {
                if (child.type === 'text') {
                  let text = child.value;
                  if (child.bold) text = `<strong>${text}</strong>`;
                  if (child.italic) text = `<em>${text}</em>`;
                  return text;
                }
                return '';
              })
              .join('');
            return `<li>${content}</li>`;
          })
          .join('');
        return `<${listType}>${items}</${listType}>`;
      }

      if (node.type === 'heading') {
        const level = node.level || 3;
        const content = node.children
          .map((child) => {
            if (child.type === 'text') {
              return child.value;
            }
            return '';
          })
          .join('');
        return `<h${level}>${content}</h${level}>`;
      }

      return '';
    };

    return renderNode(parsed);
  } catch (e) {
    console.error('Error parsing rich text:', e);
    return value;
  }
}
export default function Product() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const [openDropdown, setOpenDropdown] = useState(null);

  if (!data?.product) {
    return null;
  }

  const {product} = data;

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const isPreorder = product.tags?.includes('preorder');

  const keyBenefits = parseRichText(product.Benefits?.value);
  const keyIngredients = parseRichText(product.Ingredients?.value);
  const howToUse = parseRichText(product.howTo?.value);
  const shipping = parseRichText(product.shippingText?.value);
  const aboutFragrance = parseRichText(product.aboutTheFragrance?.value);

  return (
    <div className="product">
      <ProductImage images={product.images.nodes} />
      <div className="product-main">
        <div className="product-title-price-container">
          <div className="product-title-price">
            <p>{title}</p>
            {isPreorder && (
              <div className="product-preorder-badge-pdp">
                Preorder, Ships June 2025
              </div>
            )}
          </div>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>
        <div
          className="product-descriptor"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
        <div className="product-dropdowns">
          {keyBenefits && (
            <ProductDropdown
              title="KEY BENEFITS"
              content={keyBenefits}
              isOpen={openDropdown === 'benefits'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'benefits' ? null : 'benefits')
              }
            />
          )}
          {keyIngredients && (
            <ProductDropdown
              title="KEY INGREDIENTS"
              content={keyIngredients}
              isOpen={openDropdown === 'ingredients'}
              onToggle={() =>
                setOpenDropdown(
                  openDropdown === 'ingredients' ? null : 'ingredients',
                )
              }
            />
          )}
          {howToUse && (
            <ProductDropdown
              title="HOW TO USE"
              content={howToUse}
              isOpen={openDropdown === 'howto'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'howto' ? null : 'howto')
              }
            />
          )}
          {aboutFragrance && (
            <ProductDropdown
              title="ABOUT THE FRAGRANCE"
              content={aboutFragrance}
              isOpen={openDropdown === 'fragrance'}
              onToggle={() =>
                setOpenDropdown(
                  openDropdown === 'fragrance' ? null : 'fragrance',
                )
              }
            />
          )}
          {shipping && (
            <ProductDropdown
              title="SHIPPING"
              content={shipping}
              isOpen={openDropdown === 'shipping'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'shipping' ? null : 'shipping')
              }
            />
          )}
        </div>
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    tags
    Benefits: metafield(namespace: "custom", key: "benefits") {
      value
    }
    Ingredients: metafield(namespace: "custom", key: "ingredients") {
      value
    }
    howTo: metafield(namespace: "custom", key: "how_to") {
      value
    }
    shippingText: metafield(namespace: "custom", key: "shipping_text") {
      value
    }
    aboutTheFragrance: metafield(namespace: "custom", key: "about_the_fragrance") {
      value
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    images(first: 10) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
