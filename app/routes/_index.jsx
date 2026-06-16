import {
  Await,
  useLoaderData,
  Link,
  useRouteLoaderData,
  useNavigate,
} from '@remix-run/react';
import {Suspense, useState, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductItem} from '~/components/ProductItem';
import HPSocialShareImg from '~/assets/HP.jpg';
import black_poodle from '~/assets/black_poodle.png';
import mandog from '~/assets/man&dog.png';
import {sanityClient} from '~/sanity/sanityClient';
import {HOME_QUERY} from '~/sanity/queries/comingSoonQuery';
import {PortableText} from '@portabletext/react';
import {useInView} from 'motion/react';
import SanityInternalLink from '~/sanity/SanityInternalLink';

function getLinkTo(link) {
  if (!link) return '/';
  if (link.path) return link.path;
  if (link.type === 'collection') return `/collections/${link.slug}`;
  if (link.type === 'product') return `/products/${link.slug}`;
  if (link.slug?.startsWith('/')) return link.slug;
  return `/pages/${link.slug}`;
}

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Biche | Luxury Pet Grooming'},
    {property: 'og:title', content: 'Biche | Luxury Pet Grooming'},
    {property: 'og:image', content: HPSocialShareImg},
    {
      name: 'description',
      content:
        'Biche is a clean, vegan, and cruelty-free pet grooming brand. Dog-safe, human-loved, and veterinarian-approved.',
    },

    {
      property: 'og:description',
      content:
        'Biche is a clean, vegan, and cruelty-free pet grooming brand. Dog-safe, human-loved, and veterinarian-approved.',
    },

    {name: 'twitter:title', content: 'Biche | Luxury Pet Grooming'},
    {
      name: 'twitter:description',
      content:
        'Biche is a clean, vegan, and cruelty-free pet grooming brand. Dog-safe, human-loved, and veterinarian-approved.',
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
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);
  const sanityData = await sanityClient
    .fetch(HOME_QUERY)
    .then((response) => response);

  const productHandle = sanityData?.featuredProduct?.product?.store?.slug;
  let shopifyFeaturedProduct = null;
  if (productHandle) {
    shopifyFeaturedProduct = await context.storefront
      .query(FEATURED_PRODUCT_QUERY, {variables: {handle: productHandle}})
      .then((res) => res.product)
      .catch(() => null);
  }

  return {
    featuredCollection: collections.nodes[0],
    sanityData,
    shopifyFeaturedProduct,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenPopup = sessionStorage.getItem('klaviyoPopupShown');
      if (!hasSeenPopup) {
        setTimeout(() => {
          window._klOnsite = window._klOnsite || [];
          window._klOnsite.push(['openForm', 'YeNiVu']);
          sessionStorage.setItem('klaviyoPopupShown', 'true');
        }, 5000); // Delay popup by 5 seconds
      }
    }
  }, []);

  return (
    <div className="home">
      <Hero
        data={data?.sanityData?.hero}
        firstSection={data?.sanityData?.firstSection}
      />
      <Partners data={data?.sanityData?.imageCarousel} />
      {/* <FirstSection data={data?.sanityData?.firstSection} /> */}
      <FeaturedProduct
        sanityData={data?.sanityData?.featuredProduct}
        shopifyProduct={data?.shopifyFeaturedProduct}
      />
      <OurStandards data={data?.sanityData?.ourStandards} />
      <OffsetPills />
      <BottomSection data={data?.sanityData?.bottomSection} />
    </div>
  );
}

function Hero({data, firstSection}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    margin: '-32px 0px 0px 0px',
  });

  useEffect(() => {
    const header = document.querySelector('.header-content');
    const root = document.documentElement;
    function reset() {
      header
        .querySelectorAll('.header-menu-item')
        .forEach((item) => (item.style.color = 'var(--color-balsamic)'));
      header
        .querySelectorAll('path')
        .forEach((item) => (item.style.fill = 'var(--color-balsamic)'));
      const p = header.querySelector('p');
      if (p) p.style.color = 'var(--color-balsamic)';
      header.querySelector('.header-menu-mobile-toggle').style.color =
        'var(--color-balsamic)';
      root.style.setProperty(
        '--header-hover-indicator-color',
        'var(--color-balsamic)',
      );
    }
    if (isInView) {
      header
        .querySelectorAll('.header-menu-item')
        .forEach((item) => (item.style.color = 'var(--color-eggshell)'));
      header
        .querySelectorAll('path')
        .forEach((item) => (item.style.fill = 'var(--color-eggshell)'));
      const p = header.querySelector('p');
      if (p) p.style.color = 'var(--color-eggshell)';
      header.querySelector('.header-menu-mobile-toggle').style.color =
        'var(--color-eggshell)';
      root.style.setProperty(
        '--header-hover-indicator-color',
        'var(--color-eggshell)',
      );
    } else reset();
    return () => reset();
  }, [isInView]);

  return (
    <section className="hero-section" ref={ref}>
      <div className="hero-image left-image">
        {data?.leftImage?.link?.slug ? (
          <Link to={getLinkTo(data.leftImage.link)}>
            <img
              src={data?.leftImage?.image?.asset?.url}
              alt={data?.leftImage?.altText || 'Left visual'}
            />
          </Link>
        ) : (
          <img
            src={data?.leftImage?.image?.asset?.url}
            alt={data?.leftImage?.altText || 'Left visual'}
          />
        )}
      </div>
      <HeroLogo url={`${data?.logo?.asset?.url}`} />
      <div className="hero-image right-image">
        {data?.rightImage?.link?.slug ? (
          <Link to={getLinkTo(data.rightImage.link)}>
            <img
              src={data?.rightImage?.image?.asset?.url}
              alt={data?.rightImage?.altText || 'Right visual'}
            />
          </Link>
        ) : (
          <img
            src={data?.rightImage?.image?.asset?.url}
            alt={data?.rightImage?.altText || 'Right visual'}
          />
        )}
      </div>

      <div className="hero-text-overlay">
        <h1 className="intro-heading">{firstSection?.heroTitle}</h1>
        <div className="intro-text">
          <PortableText
            value={firstSection?.introText}
            components={{marks: {linkInternal: SanityInternalLink}}}
          />
        </div>
      </div>
    </section>
  );
}
// export function SVGComponent({url, color, className}) {
//   const [svg, setSvg] = useState(null);

//   useEffect(() => {
//     if (url && url.includes('.svg')) {
//       fetch(url)
//         .then((res) => res.text())
//         .then(setSvg)
//         .catch(console.error);
//     }
//   }, [url]);
//   return (
//     <div
//       className={className}
//       dangerouslySetInnerHTML={{
//         __html: svg,
//       }}
//       style={{color}}
//     />
//   );
// }

function FeaturedProduct({sanityData, shopifyProduct}) {
  const nav = useNavigate();
  if (!shopifyProduct) return null;

  const variants = shopifyProduct.variants.nodes;
  const isSingleVariant = variants.length === 1;
  const firstVariant = variants[0];
  return (
    <section className="featured-product-section">
      <p>FEATURED</p>
      <div className="featured-product-info">
        {shopifyProduct.featuredImage && (
          <Link
            to={`/products/${shopifyProduct.handle}`}
            style={{width: '100%'}}
          >
            <Image
              data={shopifyProduct.featuredImage}
              sizes="50vw"
              className="featured-product-image"
              style={{height: 'auto'}}
            />
          </Link>
        )}
        <div>
          <p className="featured-product-name">{shopifyProduct.title}</p>
          <ProductPrice
            price={firstVariant?.price}
            compareAtPrice={firstVariant?.compareAtPrice}
          />
        </div>
        <div>
          {sanityData?.description && (
            <p className="featured-product-description">
              {sanityData.description}
            </p>
          )}
          {sanityData?.directlyAddToCart && isSingleVariant ? (
            <AddToCartButton
              lines={[{merchandiseId: firstVariant.id, quantity: 1}]}
              onClick={() => nav('/cart')}
            >
              Add to Cart →
            </AddToCartButton>
          ) : (
            <Link to={`/products/${shopifyProduct.handle}`}>Shop Now</Link>
          )}
        </div>
      </div>
      <div className="featured-product-secondary-image">
        {sanityData?.secondaryImage?.link?.slug ? (
          <Link to={getLinkTo(sanityData.secondaryImage.link)}>
            <img
              src={sanityData?.secondaryImage?.image?.asset?.url}
              style={{width: '100%'}}
              alt={sanityData?.secondaryImage?.altText || ''}
            />
          </Link>
        ) : (
          <img
            src={sanityData?.secondaryImage?.image?.asset?.url}
            style={{width: '100%'}}
            alt={sanityData?.secondaryImage?.altText || ''}
          />
        )}
      </div>
    </section>
  );
}

function OurStandards({data}) {
  return (
    <section className="our-standards-section">
      <p>{data?.title}</p>
      <div className="our-standards-home">
        {data?.cards?.map((card) => (
          <OurStandardsCard key={card._key} card={card} />
        ))}
      </div>
    </section>
  );
}

function OurStandardsCard({card}) {
  return (
    <div className="our-standards-home-card">
      <div className="standard-card-text-container">
        <p className="standard-card-title">{card.title}</p>
        <p className="standard-card-blurb">{card.blurb}</p>
      </div>
    </div>
  );
}

function OffsetPills() {
  const data = [
    {text: 'Developed with a vet dermatologist', svg: <DermIcon />},
    {text: 'pH-optimized for pets', svg: <PhIcon />},
    {text: 'Pet-friendly scent you’ll want to steal', svg: <DogIcon />},
    {text: 'Works on all coat types and breeds', svg: <CombIcon />},
    {text: 'Vegan and cruelty-free', svg: <VeganIcon />},
    {
      text: 'No phthalates, sulfates, parabens, or silicones',
      svg: <PhthalateFreeIcon />,
    },
  ];
  return (
    <section className="offset-pills">
      <p>Formulated for their wellness, designed for your taste</p>
      <img
        src={black_poodle}
        alt="black poodle lying down looking off to the right"
      />
      <img
        className="hide-on-desktop"
        src={mandog}
        alt="black poodle lying down looking off to the right"
      />
      <div>
        {data?.map((item) => (
          <div key={item.text} className="offset-pill">
            {item.svg}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottomSection({data}) {
  return (
    <section className="bottom-section-home">
      <p className="intro-heading">{data?.title}</p>
      <div className="bottom-section-text-container">
        <div>
          <PortableText value={data?.blurb} />
        </div>
      </div>
      <div className="bottom-section-hero-image">
        <img src={data?.bannerImage?.asset?.url} alt="" />
        <PortableText value={data?.imageCaption} />
      </div>
    </section>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

function HeroLogo({url}) {
  if (!url) return null;
  return (
    <div className="hero-logo" style={{color: 'white'}}>
      <img
        src={url}
        alt="Biche"
        style={{width: '100%', height: '100%', objectFit: 'contain'}}
      />
    </div>
  );
}

function Partners({data}) {
  const images = data || [];

  const renderImage = (item, setIndex, i) => (
    <div
      className="partner-logo-container"
      key={`${item._key}-set${setIndex}-${i}`}
    >
      <img
        src={item.image?.asset?.url}
        alt={item.altText || ''}
        className="partner-logo"
        loading="eager"
      />
    </div>
  );

  return (
    <section className="home-partners-section">
      <div className="partners-carousel-mask">
        <div className="partners-carousel-track">
          <div className="partners-set" aria-hidden="false">
            {images.map((item, i) => renderImage(item, 0, i))}
          </div>
          <div className="partners-set" aria-hidden="true">
            {images.map((item, i) => renderImage(item, 1, i))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURED_PRODUCT_QUERY = `#graphql
  query FeaturedProduct($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      variants(first: 100) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    tags
    descriptionPLP: metafield(namespace: "custom", key: "description_plp") {
      value
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

function PhthalateFreeIcon() {
  return (
    <svg
      width="30"
      height="29"
      viewBox="0 0 30 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.73604 27.7689C4.73604 28.3365 4.27095 28.8016 3.70334 28.8016C2.69351 28.7302 0.655523 29.025 0.303961 28.4976C0.116278 28.3099 0 28.0527 0 27.7689V20.5499C0.000915469 19.9822 0.46418 19.5162 1.0327 19.5172H3.70341C4.27195 19.5172 4.73611 19.9814 4.73611 20.5499C4.73886 21.3912 4.73329 27.0749 4.73604 27.7689ZM14.5432 15.8422C13.3952 15.1941 6.73643 7.69584 10.5717 7.70685C10.8025 7.76087 11.0149 7.89637 11.1613 8.1051C12.5676 10.1339 14.6467 12.0656 16.9987 13.439C18.1486 11.3305 17.4958 8.86964 15.9559 6.9855C14.1697 4.74246 11.7582 3.20245 11.3535 0.165651C10.9854 -0.276545 10.1303 0.279177 9.8456 0.526377C6.86927 3.39021 5.44568 8.24786 7.41021 12.0731C8.71209 14.6393 11.8586 17.2741 14.5432 15.8414L14.5432 15.8422ZM10.6467 8.46857C10.4893 8.22321 10.0874 8.2873 10.0022 8.55738C10.3364 10.1184 11.4405 11.5072 12.2993 12.6892C13.4794 14.0616 14.6458 15.3625 16.1526 16.1828C16.6287 16.2926 17.1643 16.0619 17.3785 15.6097C17.6623 15.0869 17.4701 14.4323 16.951 14.1412C14.3839 12.6855 12.1718 10.663 10.6475 8.46858L10.6467 8.46857ZM20.085 7.55306C20.3936 7.28481 20.8083 7.77461 20.4915 8.03463C20.4869 8.03829 18.9525 9.29074 18.2146 10.9404C18.2348 11.6527 18.1221 12.3412 17.8887 12.9857C19.9129 13.6431 21.7568 12.7834 22.7574 10.7848C23.8359 8.62598 23.7068 6.199 25.7374 4.62775C25.8006 4.28444 25.2128 3.99239 24.984 3.91272C21.991 3.04755 18.2576 3.98962 16.5922 6.78475C17.2916 7.69204 17.8812 8.84927 18.0808 9.85624C18.9277 8.49576 20.0813 7.5546 20.0849 7.55278L20.085 7.55306ZM29.5507 18.414C28.865 17.7283 27.9028 18.208 26.5378 19.1217L20.3131 22.814C19.0496 23.2114 14.4839 22.7445 12.7179 24.1818C12.3123 24.5123 11.1542 23.5346 14.6423 22.7499C17.2845 22.1557 20.4778 22.7389 20.662 21.7282C20.8488 20.7055 19.7721 19.866 18.6937 19.866L12.2805 19.0484C10.3313 18.5266 7.85663 18.5248 6.52538 20.0363C6.04838 20.5774 5.66203 20.8456 5.36998 20.9527V26.1648C10.6645 25.2721 14.2057 29.63 20.055 26.5365C21.4823 25.7107 31.001 19.864 29.5519 18.414L29.5507 18.414Z"
        fill="white"
      />
    </svg>
  );
}

function CombIcon() {
  return (
    <svg
      width="39"
      height="24"
      viewBox="0 0 39 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.4909 9.15026C-1.72866 10.9532 0.589426 17.9075 5.35438 23.1875L6.6422 22.8012L4.06655 11.3396L5.35438 10.9532L8.57394 22.2861L9.86176 21.8997L7.02855 10.4381L8.44516 10.1805L11.4072 21.3846L12.8238 21.127L9.99055 9.92295L11.4072 9.40782L14.4979 20.4831L16.1721 20.0968L13.0813 8.7639L14.2404 8.50634L17.5887 19.7104L19.1341 19.3241L15.9145 8.24877L16.9448 7.99121L20.2931 18.9377L22.0961 18.5514L19.1341 7.3473L20.2931 7.08974L23.3839 18.4226L24.9293 17.9075L21.9673 6.70339L23.1264 6.44583L26.4747 17.7787L28.1489 17.2635L25.1869 6.05948L26.3459 5.80191L29.4367 17.1348L31.3684 16.6196L28.4064 5.28678L29.823 5.02921L32.785 16.2333L34.4592 15.7182L31.8836 4.64287L33.1714 3.35505L36.9061 14.5591L38.4515 14.3016C39.8681 6.96096 38.4515 -0.250866 35.2319 0.00669927C28.4064 0.264264 12.8238 2.32479 1.4909 9.15026Z"
        fill="#FFFBF8"
      />
    </svg>
  );
}

function PhIcon() {
  return (
    <svg
      width="27"
      height="30"
      viewBox="0 0 27 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.7407 8.76002C12.5006 4.92001 9.19938 0 8.84568 0C8.37407 0 0.121068 10.8 0.00316818 14.88C-0.114732 19.08 3.06857 23.28 7.78458 23.28H8.84568C8.60987 22.44 8.72778 21.6 8.84568 20.64C9.43518 17.4 12.7364 12.24 14.7407 8.76002Z"
        fill="#FFFBF8"
      />
      <path
        d="M18.8649 6.59997C18.3933 6.59997 11.0835 16.32 10.7298 20.88C10.494 24.84 13.4415 30 19.3365 30C23.6988 30 27 26.52 27 21.6C26.8821 17.16 19.3365 6.59997 18.8649 6.59997Z"
        fill="#FFFBF8"
      />
      <path
        d="M17.5986 20.64C17.5986 20.3326 17.4558 20.1008 17.2138 19.9294C16.9603 19.7499 16.6099 19.6501 16.2727 19.6501H15.5356V21.8702H16.0366C16.6942 21.8702 17.0708 21.7287 17.2805 21.5443C17.4768 21.3718 17.5986 21.0969 17.5986 20.64ZM18.4829 20.64C18.4829 21.263 18.3104 21.8281 17.8583 22.2255C17.4195 22.6112 16.7939 22.7703 16.0366 22.7703H15.5356V24.84C15.5356 25.0886 15.3376 25.2901 15.0934 25.2901C14.8493 25.2901 14.6513 25.0886 14.6513 24.84V19.2C14.6513 18.9515 14.8493 18.75 15.0934 18.75H16.2727C16.7606 18.7501 17.2942 18.8901 17.7185 19.1904C18.1543 19.499 18.4829 19.9875 18.4829 20.64Z"
        fill="#7D766E"
      />
      <path
        d="M19.1327 24.9599V19.2C19.1327 18.9515 19.3307 18.75 19.5748 18.75C19.819 18.75 20.017 18.9515 20.017 19.2V24.9599C20.017 25.2084 19.819 25.4099 19.5748 25.4099C19.3307 25.4099 19.1327 25.2084 19.1327 24.9599Z"
        fill="#7D766E"
      />
      <path
        d="M21.8455 24.9599V19.2C21.8455 18.9515 22.0435 18.75 22.2877 18.75C22.5318 18.75 22.7298 18.9515 22.7298 19.2V24.9599C22.7298 25.2084 22.5318 25.4099 22.2877 25.4099C22.0435 25.4099 21.8455 25.2084 21.8455 24.9599Z"
        fill="#7D766E"
      />
      <path
        d="M22.2845 21.5098C22.5287 21.5098 22.7267 21.7113 22.7267 21.9598C22.7267 22.2084 22.5287 22.4099 22.2845 22.4099H19.455C19.2108 22.4099 19.0128 22.2084 19.0128 21.9598C19.0128 21.7113 19.2108 21.5098 19.455 21.5098H22.2845Z"
        fill="#7D766E"
      />
    </svg>
  );
}

function VeganIcon() {
  return (
    <svg
      width="33"
      height="30"
      viewBox="0 0 33 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.6286 5.84522C19.6935 9.02748 17.7824 10.1733 15.4221 15.0926C14.3723 17.2747 12.9484 23.3771 13.5489 27.6691C14.1493 25.6349 14.8983 24.2285 15.8349 22.6379C17.6704 19.4195 20.4814 15.7567 23.8175 12.6883C20.9687 17.2386 16.361 24.7475 14.824 30C18.8712 28.7052 25.168 24.5253 27.4519 21.2696C31.6856 15.2045 33.0715 7.32509 32.9972 0C32.9972 0 25.5407 4.29195 23.6286 5.84522Z"
        fill="white"
      />
      <path
        d="M5.19255 16.4991C7.44091 19.2738 9.99011 22.1206 11.5248 24.8593C11.375 22.4922 11.638 20.7165 12.012 18.8676C11.5248 16.2408 9.08889 13.7269 6.84056 11.9864C5.04166 10.4692 2.75677 9.39683 0.021161 7.80625C-0.0531753 10.4319 0.0589013 11.6523 0.508353 14.2788C0.957807 16.8684 1.82009 20.2345 3.65559 22.1582C5.04166 23.6381 6.20356 24.7094 7.85268 25.8947C9.09009 26.782 10.2142 27.8555 11.1132 29.077C11.3008 29.3727 11.5627 29.6324 11.7502 29.9281C10.291 25.4501 7.32886 20.2721 5.19372 16.4995L5.19255 16.4991Z"
        fill="white"
      />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg
      width="38"
      height="30"
      viewBox="0 0 38 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.5918 0H13.4022C8.84345 0 6.21872 5.27721 9.39603 8.88793L14.0929 14.7206C16.4413 17.7759 21.0001 18.0536 23.3485 15.1373L28.4598 9.0268C31.9134 5.55496 29.7031 0 24.5918 0Z"
        fill="#FFFBF8"
      />
      <path
        d="M35.641 16.9429C34.674 17.2206 33.8452 18.0539 33.8452 19.1649C33.8452 22.2201 31.3586 24.8587 27.6287 24.8587C24.5895 24.8587 21.136 22.6367 21.136 18.4705C19.8927 19.1649 16.9916 18.7482 16.3009 18.4705C16.9916 22.359 14.0906 24.8587 10.7752 24.8587C7.73603 24.8587 4.55873 22.6367 4.55873 19.1649C4.55873 17.915 3.45359 16.6651 2.07215 16.9429C0.967005 17.0818 0 17.915 0 19.1649C0 24.7198 4.55873 29.8581 10.637 29.997C14.0906 29.997 16.9917 28.6083 18.9257 25.8308C20.7215 28.3305 23.7607 29.997 27.3524 29.997C33.5689 30.1359 37.9895 25.4142 37.9895 19.4426C38.1276 17.915 36.8843 16.9429 35.641 16.9429Z"
        fill="#FFFBF8"
      />
    </svg>
  );
}

function DermIcon() {
  return (
    <svg
      width="16"
      height="30"
      viewBox="0 0 16 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.91838 0.475597L8.00447 4.91266H9.55398L9.4679 2.96035L10.0705 1.80671L9.55398 1.27427L9.4679 0.0318914C8.60706 -0.145591 7.91838 0.475597 7.91838 0.475597Z"
        fill="#FFFBF8"
      />
      <path
        d="M12.3961 5.35629L5.33722 5.44503C3.01294 4.82384 0.0860816 6.06622 0.172166 6.2437C0.344334 6.50992 2.06602 6.86489 2.06602 6.86489L0 7.13111L2.23819 7.21985L1.6356 7.57482C1.6356 7.57482 0.860841 8.01853 3.95987 7.92978C5.76764 7.84104 10.9327 6.95363 12.5683 7.66356C13.6013 8.19601 13.6013 9.61587 12.8265 11.3019L14.0317 11.8344C16.9586 10.592 16.7864 5.88874 12.3961 5.35629ZM2.75469 6.2437C2.66861 6.2437 2.58253 6.15496 2.58253 6.06622C2.58253 5.97748 2.66861 5.88874 2.75469 5.88874C2.84078 5.88874 2.92686 5.97748 2.92686 6.06622C3.01295 6.15496 2.92686 6.2437 2.75469 6.2437Z"
        fill="#FFFBF8"
      />
      <path
        d="M4.5954 12.3014C4.11913 12.4902 3.77559 12.756 3.5555 13.0963C3.33721 13.4339 3.20591 13.8977 3.24265 14.5482L3.25071 14.6321C3.30868 15.0518 3.61219 15.4861 4.17353 15.8244C4.76433 16.1804 5.56893 16.3781 6.40187 16.3L6.50628 17.4856C5.44541 17.585 4.39886 17.339 3.59082 16.8521C2.79082 16.3699 2.14939 15.5974 2.09029 14.6226V14.6206C2.04143 13.7638 2.21108 13.0301 2.59507 12.4363C2.97757 11.8448 3.53799 11.4451 4.18082 11.1902L4.5954 12.3014Z"
        fill="#FFFBF8"
      />
      <path
        d="M13.0219 18.6676C13.0219 18.3513 12.8722 18.0559 12.5862 17.7871C12.2968 17.5151 11.9048 17.3093 11.5394 17.1963L11.871 16.0567C12.3665 16.2099 12.9216 16.4922 13.3639 16.9079C13.8096 17.3268 14.1765 17.919 14.1765 18.6676C14.1765 20.1877 12.7438 21.314 10.9003 21.214L10.9609 20.0257C12.3885 20.1031 13.0218 19.2772 13.0219 18.6676Z"
        fill="#FFFBF8"
      />
      <path
        d="M8.60974 26.6541L8.69582 24.7018L8.35148 24.5244L8.2654 26.8316L8.60974 26.6541Z"
        fill="#FFFBF8"
      />
      <path
        d="M8.00521 26.5654C7.23046 27.2753 8.69388 27.719 9.1243 28.3402C9.55473 29.0501 8.69388 30.2925 8.6078 29.9375C8.34955 28.2515 6.80003 28.8726 6.62786 27.5415C6.54178 25.9442 7.91912 25.7667 7.91912 25.7667L8.00521 26.5654Z"
        fill="#FFFBF8"
      />
      <path
        d="M8.52345 15.2955H9.55646L9.38429 7.84126H8.43737L8.52345 15.2955Z"
        fill="#FFFBF8"
      />
      <path
        d="M6.28465 10.4146L7.74808 11.5682L6.62898 11.8344L6.28465 10.4146Z"
        fill="#FFFBF8"
      />
      <path
        d="M9.89913 10.947L11.4486 10.4146L11.1904 11.657L9.89913 11.9232V10.947Z"
        fill="#FFFBF8"
      />
      <path
        d="M10.6727 23.0158C9.29531 22.6608 6.11019 23.3707 6.19628 21.8621C6.19628 21.5072 6.71279 21.2409 6.71279 21.2409L6.45453 20.0873C5.16327 19.9098 3.26942 21.5072 4.73285 23.1932C5.93803 24.4356 9.98398 24.1694 10.0701 24.5244C10.5866 25.0568 9.55357 26.5654 9.55357 26.5654C10.5005 26.2104 13.4274 24.8793 11.3613 23.282L10.6727 23.0158Z"
        fill="#FFFBF8"
      />
      <path
        d="M5.76549 9.39404L5.80081 9.39721C5.88134 9.41096 5.94857 9.47112 5.97201 9.55391L8.78921 19.512L11.9311 9.54758L11.9442 9.51474C11.9806 9.44159 12.0541 9.39406 12.1357 9.39404H13.9434C14.0107 9.39404 14.0743 9.42664 14.115 9.48189C14.1556 9.53719 14.1688 9.60896 14.1507 9.67579L10.5354 22.9872C10.5094 23.0829 10.4246 23.149 10.3281 23.1491H7.31516C7.22064 23.1491 7.13716 23.0855 7.10941 22.9923L3.14945 9.68094C3.12951 9.61374 3.14159 9.5408 3.18208 9.48427C3.22266 9.42768 3.28694 9.39404 3.3552 9.39404H5.76549ZM7.47446 22.7055H10.165L13.6601 9.83804H12.292L8.98306 20.3335C8.95387 20.4261 8.86974 20.4881 8.77539 20.4867C8.681 20.4852 8.59842 20.4206 8.57194 20.3272L5.60427 9.83804H3.64617L7.47446 22.7055Z"
        fill="#FFFBF8"
      />
    </svg>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
