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
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.8066 0.00121712C19.2221 0.00381298 22.8042 2.1104 25.2666 5.05981C27.722 8.0009 29.0928 11.8099 29.0928 15.303C29.0927 23.9635 22.3177 29.9993 14.5967 29.9993C5.45589 29.9991 1.45338e-05 21.6288 0 15.0002C0 6.67603 6.54132 -0.104389 14.8066 0.00121712ZM14.4414 1.35376C7.13494 1.44975 1.35254 7.50666 1.35254 15.0002C1.35255 21.0807 6.38771 28.6466 14.5967 28.6467C21.6029 28.6467 27.7402 23.1844 27.7402 15.303C27.7402 12.139 26.4878 8.63439 24.2275 5.927C21.9758 3.23004 18.7516 1.35382 14.7988 1.35376H14.4414ZM13.4873 3.30005C15.607 3.78918 16.408 5.00246 16.0518 6.08911C17.4878 5.43199 19.2332 5.21143 21.1543 5.5188C19.843 7.33432 20.347 9.95678 17.7246 11.1672C17.3031 11.378 16.9259 11.4875 16.5781 11.5354C16.6137 11.6177 16.6152 11.7028 16.6113 11.759C16.6047 11.8552 16.5764 11.9677 16.5498 12.0725C16.5211 12.1856 16.4881 12.3098 16.458 12.4543C16.3461 12.9917 16.2734 13.8128 16.7676 14.9299C17.2383 14.2725 17.3046 13.4338 17.374 12.9475L17.3809 12.9172C17.3997 12.848 17.4143 12.7942 17.4258 12.7571C17.4313 12.7393 17.4378 12.7191 17.4443 12.7024C17.4472 12.695 17.4532 12.6803 17.4619 12.6643C17.466 12.6568 17.4759 12.6398 17.4912 12.6213C17.4983 12.6128 17.5488 12.5501 17.6416 12.5334C17.6996 12.5231 17.762 12.533 17.8154 12.5647C17.8631 12.593 17.8897 12.6306 17.9033 12.6536C17.9282 12.6955 17.935 12.7348 17.9365 12.7444C17.9408 12.7709 17.9396 12.7936 17.9395 12.8C17.9389 12.8187 17.9373 12.8389 17.9355 12.8538C17.9317 12.8862 17.9248 12.9307 17.917 12.9817C17.8849 13.1916 17.8232 13.5669 17.7734 13.9836C17.7234 14.4029 17.6873 14.8494 17.7051 15.1975C17.7141 15.3731 17.7363 15.5069 17.7676 15.595C17.7844 15.6423 17.7986 15.6622 17.8047 15.6692L18.7129 15.9719C18.8445 16.0162 18.9157 16.1585 18.8721 16.2903C18.828 16.4224 18.6848 16.4944 18.5527 16.4504L17.6455 16.1467C17.4461 16.0847 17.344 15.9101 17.292 15.7639C17.2366 15.6081 17.2111 15.4175 17.2012 15.2229C17.2006 15.2126 17.2006 15.202 17.2002 15.1916C16.9902 15.4946 16.7099 15.7726 16.3311 15.9846L16.5938 16.0725C16.7721 16.1196 16.9098 16.2363 17.0137 16.3704C17.1223 16.5106 17.2083 16.6867 17.2783 16.8723C17.4184 17.2436 17.5131 17.7058 17.583 18.1379C17.5858 18.1551 17.5871 18.1726 17.5898 18.1897L17.6768 17.5872C17.6908 17.4897 17.7601 17.4091 17.8545 17.3811C17.9489 17.3531 18.0513 17.3832 18.1162 17.4573C18.5016 17.8978 19.0751 18.924 19.2969 20.176C19.5203 21.4376 19.3903 22.9525 18.3281 24.3332L18.3262 24.3342C17.3724 25.5529 15.7898 26.3702 14.1895 26.4231C12.6249 26.4747 11.0464 25.7946 10.0342 24.0666L9.9375 23.8957C8.55196 21.3376 9.734 18.4863 11.6182 17.0207L11.6211 17.0188C12.8408 16.0918 13.3169 15.1449 13.3623 14.3059C13.4078 13.4622 13.0204 12.671 12.4014 12.052C12.3544 12.0104 12.3106 11.965 12.2764 11.9163C12.2399 11.8643 12.199 11.7874 12.1982 11.6926C12.1975 11.586 12.2465 11.5 12.3096 11.4426C12.3303 11.4238 12.3537 11.41 12.376 11.3967C12.3001 11.3624 12.2423 11.2918 12.2295 11.2034C12.2098 11.0655 12.3065 10.9379 12.4443 10.9182C12.6578 10.8878 12.9414 10.9114 13.2393 10.9456C13.4952 10.9749 13.7673 11.0098 14.0635 11.0432C14.0186 10.5355 14.1187 10.095 14.2949 9.65454C14.3183 9.60776 14.2802 9.45853 14.1855 9.25219C10.9658 9.95114 10.7634 6.82954 9.75586 5.31762C11.4704 5.21683 12.5795 5.51942 13.4873 6.02368V3.30005ZM12.8955 11.7903C12.8809 11.7911 12.8669 11.7932 12.8535 11.7942C13.4931 12.4744 13.9189 13.3588 13.8662 14.3332C13.8107 15.3601 13.2274 16.4309 11.9258 17.4202C10.1803 18.7793 9.14493 21.3734 10.3809 23.6555C11.2908 25.3314 12.7368 25.9666 14.1729 25.9192C15.6239 25.8712 17.0678 25.1249 17.9297 24.0237C18.0227 23.9027 18.106 23.7794 18.1836 23.6565C15.6788 26.781 9.50464 26.584 10.6631 19.9426H17.4424C17.4195 19.9249 17.4018 19.9084 17.3916 19.8957C17.3452 19.8379 17.3231 19.7662 17.3125 19.7288C17.2863 19.6356 17.2642 19.5011 17.2432 19.3547C17.1988 19.0461 17.1542 18.6458 17.085 18.218C17.0162 17.793 16.9281 17.3721 16.8066 17.05C16.7459 16.8891 16.6811 16.765 16.6152 16.6799C16.5494 16.5949 16.4954 16.5659 16.459 16.5579C16.4508 16.556 16.4426 16.5537 16.4346 16.551L15.5264 16.2483C15.4214 16.2132 15.3518 16.1138 15.3545 16.0032C15.3573 15.8924 15.4323 15.7956 15.5391 15.7659C15.8922 15.6677 16.1735 15.5147 16.3984 15.3284C16.3952 15.3227 16.3906 15.3177 16.3877 15.3118C15.7537 13.9909 15.83 12.999 15.9648 12.3518C15.9977 12.1939 16.0343 12.0559 16.0615 11.9485C16.0742 11.8986 16.0834 11.8571 16.0908 11.8235C15.1301 11.871 14.0597 11.7975 13.3574 11.7854C13.177 11.7823 13.0214 11.7831 12.8955 11.7903ZM17.874 19.7766C17.8663 19.8306 17.8403 19.8806 17.8018 19.9192C17.7946 19.9263 17.7859 19.9344 17.7754 19.9426H18.7334C18.5771 19.2775 18.3233 18.7036 18.085 18.2932L17.874 19.7766ZM18.4307 6.72973C16.909 7.11014 16.004 8.22309 15.4912 9.26294C16.6989 7.81961 18.4215 6.73551 18.4307 6.72973ZM11.3691 7.03149C13.1991 7.76344 14.0317 8.9948 14.1709 9.21704C13.8416 8.5251 12.8931 7.26007 11.3691 7.03149Z"
        fill="#FFFBF8"
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
      width="37"
      height="30"
      viewBox="0 0 37 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M31.0408 14.8062C30.3661 14.5813 28.7917 14.3565 28.7917 14.3565C27.4423 11.5457 21.932 5.24955 16.1969 7.72303C20.4701 6.93602 24.6309 10.0841 28.3419 15.8181C29.6913 15.2559 30.8159 15.8181 30.8159 15.8181C30.591 17.1672 28.5668 18.404 28.5668 18.404C30.9283 18.9661 34.1895 15.8181 31.0408 14.8062Z"
        fill="#FFFBF8"
      />
      <path
        d="M15.182 0.190399C22.0416 -0.259324 28.9013 3.1136 33.0621 10.534L35.0863 10.4216C31.2628 3.90062 24.6281 -1.04634 15.182 0.190399Z"
        fill="#FFFBF8"
      />
      <path
        d="M29.4683 28.0732C23.8456 30.6591 15.1867 31.5586 7.53983 24.8127L9.45154 23.8009C12.4878 26.7241 20.0222 31.3337 29.4683 28.0732Z"
        fill="#FFFBF8"
      />
      <path
        d="M32.0534 19.8659L31.9409 19.9783C30.9288 21.1027 29.5794 22.9016 27.6677 22.7891C26.0933 22.7891 22.3823 20.2032 21.0329 18.4043C21.3703 20.4281 25.756 23.9134 26.9929 24.2507C29.242 24.9253 31.0413 22.9016 31.716 22.0021C31.4911 24.0259 33.7402 28.4107 36.664 27.2864C34.4149 26.4993 32.5032 22.9016 32.0534 19.8659Z"
        fill="#FFFBF8"
      />
      <path
        d="M31.0385 23.6883C29.4641 24.925 30.0264 29.1974 32.9502 28.8601C31.4883 27.9607 30.8136 25.4872 31.0385 23.6883Z"
        fill="#FFFBF8"
      />
      <path
        d="M14.3978 2.77601C12.4861 2.66358 10.237 4.01275 9.00003 4.5749L8.55021 4.23761C10.1246 2.43872 11.474 2.32629 13.2733 1.87657C11.6989 0.639827 9.5623 1.53927 7.65059 4.23761C5.85133 4.57491 3.37735 5.47435 3.15244 6.93595C3.03999 10.1964 4.72679 11.3208 6.4136 11.7705C6.75096 13.4569 7.87549 14.6937 7.87549 15.4807C6.52605 15.818 4.27698 16.605 3.37735 18.0666C7.53813 16.7174 10.5744 17.1672 13.6106 19.3033C13.1608 17.5044 11.2491 16.2677 9.7872 16.1553C8.77512 15.7056 6.97586 13.0072 7.08832 11.658C5.06415 10.9835 3.93962 9.297 3.93962 7.72297C5.06415 7.8354 5.06415 7.04838 5.06415 7.04838L3.93962 6.71109C4.83924 5.69921 7.31322 4.79977 8.43776 6.03651C8.88757 5.92407 9.5623 6.03651 10.237 5.69921C11.2491 4.79977 13.8355 3.78789 14.0604 4.01275C13.2733 5.24949 11.2491 7.38568 10.237 7.72297C13.2733 8.28512 16.422 3.00087 14.3978 2.77601Z"
        fill="#FFFBF8"
      />
      <path
        d="M6.97471 6.14955L6.52489 6.71171L8.2117 6.82414C8.2117 6.82414 8.09925 5.92469 6.97471 6.14955Z"
        fill="#FFFBF8"
      />
      <path
        d="M0 14.0194L0.899629 12.6702C1.57435 12.108 3.82342 12.108 4.83551 13.5696H2.58643L0 14.0194Z"
        fill="#FFFBF8"
      />
      <path
        d="M5.06065 20.3155L6.74746 20.9901L5.39802 22.9014L7.08482 22.4517L7.53463 23.1263L8.0969 21.4398L9.22144 21.1025L7.87199 20.4279L7.53463 19.1912L6.97237 20.5404L5.06065 20.3155Z"
        fill="#FFFBF8"
      />
      <path
        d="M32.7268 13.0078L34.4136 13.7948L33.289 16.0435L34.8634 14.9191L36.2128 16.0435L35.763 14.2446L37 13.0078L35.3132 13.1203L34.6385 11.6587L34.1887 13.1203L32.7268 13.0078Z"
        fill="#FFFBF8"
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
