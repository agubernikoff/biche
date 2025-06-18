import {Await, useLoaderData, Link, useRouteLoaderData} from '@remix-run/react';
import {Suspense, useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import mobileIcon from '~/assets/mobile_icon.jpg';
import {sanityClient} from '~/sanity/sanityClient';
import {ABOUT_QUERY} from '~/sanity/queries/comingSoonQuery';
import PrimaryLogo from '~/assets/PrimaryLogo';
import monogram from '~/assets/MONOGRAM.png';
import {PortableText} from '@portabletext/react';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Biche | About'}];
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
  const sanityData = await sanityClient
    .fetch(ABOUT_QUERY)
    .then((response) => response);
  return {
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
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const {sanityData} = useLoaderData();
  console.log(sanityData);

  return (
    <div className="home">
      <Hero data={sanityData.hero} />
      <FounderSection data={sanityData.quoteAndImage} />
      {/* <FirstSection data={data.sanityData.firstSection} />
      <OurStandards data={data.sanityData.ourStandards} />
      <BottomSection data={data.sanityData.bottomSection} /> */}
    </div>
  );
}

function Hero({data}) {
  console.log(data);
  return (
    <section className="about-hero-section hero-section ">
      <div className="about-hero-image">
        <img src={`${data.image?.asset.url}/?w=900`} alt="Left visual" />
      </div>
      <div className="about-text-container">
        <div>
          <p className="intro-heading">{data.title}</p>
          <p>{data.blurb}</p>
        </div>
      </div>
    </section>
  );
}

function FounderSection({data}) {
  return (
    <section className="founder-section">
      <div className="founder-quote">
        <p className="quote-text">{data.quote}</p>
        <p className="quote-author">{data.author}</p>
      </div>
      <div className="founder-image">
        <img src={`${data.image?.asset.url}/?w=900`} alt="Founder" />
      </div>
    </section>
  );
}

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
  console.log(data);
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
  console.log(data);
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
