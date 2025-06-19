import {Await, useLoaderData, Link, useRouteLoaderData} from '@remix-run/react';
import {Suspense, useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import mobileIcon from '~/assets/mobile_icon.jpg';
import {sanityClient} from '~/sanity/sanityClient';
import {HOME_QUERY} from '~/sanity/queries/comingSoonQuery';
import PrimaryLogo from '~/assets/PrimaryLogo';
import monogram from '~/assets/MONOGRAM.png';
import {PortableText} from '@portabletext/react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Biche'},
    {name: 'og:title', property: 'Biche'},
    {property: 'og:image', content: mobileIcon},
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
  return {
    featuredCollection: collections.nodes[0],
    sanityData,
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

  return (
    <div className="home">
      <Hero data={data.sanityData.hero} />
      <FirstSection data={data.sanityData.firstSection} />
      <OurStandards data={data.sanityData.ourStandards} />
      <BottomSection data={data.sanityData.bottomSection} />
    </div>
  );
}

function Hero({data}) {
  return (
    <section className="hero-section">
      <div className="hero-image left-image">
        <img src={`${data.leftImage?.asset.url}/?w=900`} alt="Left visual" />
      </div>
      {/* <SVGComponent
        url={`${data.logo?.asset.url}/?w=900`}
        color={'white'}
        className={'hero-logo'}
      /> */}
      <div className="hero-logo">
        <PrimaryLogo color={'white'} />
      </div>
      <div className="hero-image right-image">
        <img src={data.rightImage?.asset.url} alt="Right visual" />
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

function FirstSection({data}) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8,1fr)',
        rowGap: '8rem',
      }}
    >
      <div style={{gridColumn: 'span 4'}}>
        <p className="intro-heading">{data.heroTitle}</p>
      </div>
      <div style={{gridColumn: 'span 4'}}>
        <p className="intro-text" style={{width: '75%', marginBottom: '2rem'}}>
          {data.introText}
        </p>
        <Link
          to={'/about'}
          className="intro-text"
          style={{
            color: '#3c0707',
            padding: '.5rem',
            borderBottom: '1px solid #3c0707',
          }}
        >
          Learn More →
        </Link>
      </div>
      <div
        className="first-section-images-container"
        style={{
          gridColumn: 'span 8',
          display: 'grid',
          gridTemplateColumns: 'subgrid',
          alignItems: 'center',
        }}
      >
        <div style={{gridColumn: 'span 3'}}>
          <img src={data.mainImage.asset.url} style={{width: '100%'}} />
        </div>
        <div style={{gridColumn: '5 / 7'}}>
          <img src={data.secondaryImage.asset.url} style={{width: '100%'}} />
        </div>
        <div
          style={{
            gridColumn: '8 / 9',
            display: 'flex',
            alignItems: 'flex-end',
            height: '100%',
          }}
        >
          <img src={monogram} alt="" />
        </div>
      </div>
    </section>
  );
}

function OurStandards({data}) {
  return (
    <section>
      <p className="intro-heading" style={{paddingBlock: '2rem'}}>
        {data.title}
      </p>
      <div className="our-standards-home">
        {data.cards.map((card) => (
          <OurStandardsCard key={card._key} card={card} />
        ))}
      </div>
    </section>
  );
}

function OurStandardsCard({card}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="our-standards-home-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={card.image.asset.url}
        style={{transition: 'all 300ms ease-in-out', opacity: hovered ? 0 : 1}}
      />
      <div
        style={{transition: 'all 300ms ease-in-out', opacity: hovered ? 1 : 0}}
      >
        <p>{card.title}</p>
        <div>
          <p>{card.blurb}</p>
          <Link to="/about#our-standards">Learn More</Link>
        </div>
      </div>
    </div>
  );
}

function BottomSection({data}) {
  return (
    <section>
      <div className="bottom-section-hero-image">
        <img src={data.bannerImage.asset.url} />
      </div>
      <div className="bottom-section-text-container">
        <p>{data.title}</p>
        <div>
          <PortableText value={data.blurb} />
        </div>
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
