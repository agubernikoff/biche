import {
  useLoaderData,
  redirect,
  useActionData,
  Form,
  json,
} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {motion, AnimatePresence} from 'motion/react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  if (!data?.product) {
    return [{title: 'Biche'}];
  }

  const image = data?.product?.images?.nodes?.[0];

  return [
    {title: `Biche ${data.product.title}`},
    {
      rel: 'canonical',
      href: `/products/${data.product.handle}`,
    },
    {property: 'og:image', content: image?.url},
    {property: 'og:image:width', content: image?.width},
    {property: 'og:image:height', content: image?.height},
    {property: 'og:image:alt', content: image?.altText ?? data?.product.title},
  ];
};

/**
 * @param {ActionFunctionArgs} args
 */
export async function action({request, context}) {
  const formData = await request.formData();
  const password = formData.get('password');
  const productPassword = formData.get('productPassword');
  const productHandle = formData.get('productHandle');

  if (password === productPassword) {
    // Password is correct - set session cookie
    const {session} = context;
    session.set(`product_access_${productHandle}`, true);

    return json(
      {success: true},
      {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      },
    );
  }

  // Password is incorrect
  return json({success: false, error: 'Incorrect password. Please try again.'});
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // if (process.env.NODE_ENV !== 'development') return redirect('/');
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
  const {storefront, session} = context;

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

  // Check if user has access via session
  const hasAccess = session.get(`product_access_${handle}`);

  return {
    product,
    hasAccess: hasAccess || false,
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

export default function Product() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const actionData = useActionData();
  const [isEAOpen, setIsEAOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleSection = (section) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  // Check if password was successfully validated
  useEffect(() => {
    if (actionData?.success) {
      setIsAuthenticated(true);
    }
  }, [actionData]);

  if (!data?.product) {
    return null;
  }

  const {product} = data;
  console.log(product);
  const productPassword = product.password?.value;
  const hasSessionAccess = data.hasAccess;

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Remove default Title option from URL params
  const selectedOptionsForUrl = selectedVariant.selectedOptions.filter(
    (option) => !(option.name === 'Title' && option.value === 'Default Title'),
  );

  // Sets the search param to the selected variant without navigation
  useSelectedOptionInUrlParam(selectedOptionsForUrl);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  // Show password form if product has a password and user is not authenticated
  if (productPassword && !isAuthenticated && !hasSessionAccess) {
    return <PasswordProtectedView product={product} actionData={actionData} />;
  }

  const {title, descriptionHtml} = product;

  const productBadgeText = product.productBadge?.value;
  const isPreorder = product.tags?.includes('preorder');
  const isBackInStockNotify = product?.tags?.includes('notify back in stock');
  console.log(product.tags, isBackInStockNotify);
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
            {productBadgeText && (
              <div className="product-preorder-badge-pdp">
                {productBadgeText}
              </div>
            )}
          </div>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>
        <div className="product-content-track">
          <div
            className="product-descriptor"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
          <div className="product-dropdowns">
            {keyBenefits && (
              <Expandable
                title="KEY BENEFITS"
                details={keyBenefits}
                openSection={openDropdown}
                toggleSection={toggleSection}
              />
            )}
            {keyIngredients && (
              <Expandable
                title="KEY INGREDIENTS"
                details={keyIngredients}
                openSection={openDropdown}
                toggleSection={toggleSection}
              />
            )}
            {howToUse && (
              <Expandable
                title="HOW TO USE"
                details={howToUse}
                openSection={openDropdown}
                toggleSection={toggleSection}
              />
            )}
            {aboutFragrance && (
              <Expandable
                title="ABOUT THE FRAGRANCE"
                details={aboutFragrance}
                openSection={openDropdown}
                toggleSection={toggleSection}
              />
            )}
            {shipping && (
              <Expandable
                title="SHIPPING"
                details={shipping}
                openSection={openDropdown}
                toggleSection={toggleSection}
              />
            )}
          </div>
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            isPreorder={isPreorder}
            isBackInStockNotify={isBackInStockNotify}
            openEarlyAccess={() => setIsEAOpen(true)}
          />
        </div>
      </div>
      <AnimatePresence>
        {isEAOpen ? (
          <EarlyAccessPopUp
            closePopUp={() => setIsEAOpen(false)}
            selectedVariant={selectedVariant}
            image={product.images.nodes[0]}
            isBackInStockNotify={isBackInStockNotify}
          />
        ) : null}
      </AnimatePresence>
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

function PasswordProtectedView({product, actionData}) {
  const productPassword = product.password?.value;
  const [shouldShake, setShouldShake] = useState(false);

  // Trigger shake animation when there's an error
  useEffect(() => {
    if (actionData?.error) {
      setShouldShake(true);
      // Reset shake state after animation completes
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <motion.div
      className="password-protected-container"
      key="password-protected-container"
      initial={{opacity: 1}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <motion.div
        className="password-form-wrapper"
        animate={
          shouldShake
            ? {
                x: [0, -10, 10, -10, 10, 0],
              }
            : {}
        }
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
      >
        <div className="password-form-content">
          <h2>Enter Access Code</h2>
          <p>Unlock early access to our debut products.</p>

          <Form method="post" className="password-form">
            <input
              type="hidden"
              name="productPassword"
              value={productPassword}
            />
            <input type="hidden" name="productHandle" value={product.handle} />
            <div className="password-input-group">
              <input
                type="password"
                name="password"
                placeholder="Access Code"
                required
                autoFocus
              />
              <button type="submit">Enter</button>
            </div>
            {/* {actionData?.error && (
              <p className="password-error">{actionData.error}</p>
            )} */}
          </Form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EarlyAccessPopUp({
  closePopUp,
  selectedVariant,
  image,
  isBackInStockNotify,
}) {
  console.log(selectedVariant);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState();
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePopUp();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closePopUp]);

  function subscribe(email, btn, originalText) {
    if (!email) {
      btn.innerText = 'Please Enter A Valid Email';
      setTimeout(() => {
        btn.innerText = originalText;
      }, 1500);
      return;
    }
    const payload = isBackInStockNotify
      ? {
          data: {
            type: 'back-in-stock-subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: `${email}`,
                  },
                },
              },
              channels: ['EMAIL'],
            },
            relationships: {
              variant: {
                data: {
                  type: 'catalog-variant',
                  id: `$shopify:::$default:::${
                    selectedVariant.id.split('ProductVariant/')[1]
                  }`,
                },
              },
            },
          },
        }
      : {
          data: {
            type: 'subscription',
            attributes: {
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: `${email}`,
                  },
                },
              },
            },
            relationships: {
              list: {
                data: {
                  type: 'list',
                  id: 'V9ZSHm',
                },
              },
            },
          },
        };

    var requestOptions = {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        revision: '2025-04-15',
      },
      body: JSON.stringify(payload),
    };
    fetch(
      `https://a.klaviyo.com/client/${isBackInStockNotify ? 'back-in-stock-subscriptions' : 'subscriptions'}/?company_id=Ws4Y78`,
      requestOptions,
    )
      .then((result) => {
        if (result.ok) {
          setSuccess(true);
        } else {
          btn.innerText =
            'YOUR REQUEST COULD NOT BE COMPLETED. PLEASE EMAIL test@test.com TO BE NOTIFIED';
          setTimeout(() => {
            btn.innerText = originalText;
          }, 1500);
        }
      })
      .catch((error) => console.log('error', error));
  }

  return (
    <motion.div
      onClick={closePopUp}
      className="notify-me-overlay"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <div className="notify-me-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={closePopUp}>
          Close
          <X />
        </button>
        <img src={image.url} alt={image.altText} />
        <AnimatePresence mode="popLayout">
          <motion.div
            className="early-access-content-container"
            key={success}
            initial={{opacity: !success ? 1 : 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            {success ? (
              <h3>You're In!</h3>
            ) : (
              <>
                <h3>
                  {isBackInStockNotify ? 'Back in Stock' : 'Early Access'}
                </h3>
                <p>
                  {isBackInStockNotify
                    ? `Sign up to get alerted when ${selectedVariant?.product?.title} is back in stock.`
                    : 'Sign up to unlock early access to our debut products, coming soon.'}
                </p>
                <div className="ea-form">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    style={{borderRadius: '0'}}
                  ></input>
                  <button
                    onClick={(e) => {
                      subscribe(email, e.target, e.target.innerText);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function X({styles}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{...styles}}
    >
      <path
        d="M9.21272 8.74755C9.30243 8.83726 9.30243 8.98302 9.21272 9.07272C9.16788 9.11757 9.10879 9.13999 9.05014 9.13999C8.99148 9.13999 8.93241 9.11757 8.88755 9.07272L5.14 5.32517L1.39245 9.07272C1.3476 9.11757 1.28852 9.13999 1.22986 9.13999C1.17121 9.13999 1.11213 9.11757 1.06728 9.07272C0.977575 8.98302 0.977575 8.83726 1.06728 8.74755L4.81483 5L1.06728 1.25245C0.977575 1.16275 0.977575 1.01699 1.06728 0.927291C1.15698 0.837591 1.30274 0.837591 1.39244 0.927291L5.13999 4.67484L8.88754 0.927291C8.97724 0.837591 9.123 0.837591 9.2127 0.927291C9.3024 1.01699 9.3024 1.16275 9.2127 1.25245L5.46515 5L9.21272 8.74755Z"
        fill="black"
        stroke="black"
        strokeWidth="0.8"
      />
    </svg>
  );
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

function Expandable({
  openSection,
  toggleSection,
  title,
  details,
  isFirstRender,
}) {
  return (
    <motion.div
      key={title}
      className="product-dropdown"
      layout={!isFirstRender ? 'position' : false}
      initial={{height: '46px'}}
      animate={{height: openSection === title ? 'auto' : '46px'}}
      style={{overflow: 'hidden'}}
    >
      <motion.p
        layout={!isFirstRender ? 'position' : false}
        className={`product-dropdown-header ${openSection === title ? 'open' : ''}`}
        onClick={() => toggleSection(title)}
      >
        <span className="dropdown-title">{title}</span>
        <span className={`icon ${openSection === title ? 'open' : ''}`}>
          <SVG />
        </span>
      </motion.p>
      <div style={{overflow: 'hidden'}}>
        <motion.div
          className="product-dropdown-content"
          initial={{opacity: 0}}
          animate={{opacity: openSection === title ? 1 : 0}}
          key={title}
          transition={{ease: 'easeOut'}}
          dangerouslySetInnerHTML={{__html: details}}
        ></motion.div>
      </div>
    </motion.div>
  );
}

function SVG() {
  return (
    <svg
      width="10"
      height="4"
      viewBox="0 0 10 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.37325 3.25842L9.85965 2.17807e-05L0.886719 2.21729e-05L5.37325 3.25842Z"
        fill="#3C0707"
      />
    </svg>
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
    password: metafield(namespace: "custom", key: "password") {
      value
    }
    productBadge: metafield(namespace: "custom", key: "product_badge") {
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
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
