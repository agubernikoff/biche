import {useNavigate, useLoaderData, Link, useLocation} from '@remix-run/react';
import {useRef, useState, useEffect} from 'react';
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

  return (
    <div className="home about">
      <Hero data={sanityData.hero} />
      <FounderSection data={sanityData.quoteAndImage} />
      <ImageAndCopy data={sanityData.imageAndCopy} />
      <OurStandards data={sanityData.ourStandards} />
      <OurTeam data={sanityData.ourTeam} />
    </div>
  );
}

function Hero({data}) {
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
        <p className="quote-author">{data.quotee}</p>
      </div>
      <div className="founder-image">
        <img src={`${data.image?.asset.url}/?w=900`} alt="Founder" />
      </div>
    </section>
  );
}

function ImageAndCopy({data}) {
  return (
    <section className="image-and-copy">
      <div className="">
        <PrimaryLogo color={'var(--color-balsamic)'} />
      </div>
      <div className="bottom-section-text-container">
        <div>
          <PortableText value={data.blurb} />
        </div>
      </div>
    </section>
  );
}

function OurStandards({data}) {
  const {hash} = useLocation();
  const section = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (hash === '#our-standards' && section.current) {
      const rootStyles = getComputedStyle(document.documentElement);
      const offsetValue = rootStyles.getPropertyValue('--header-height').trim();
      const offset = parseInt(offsetValue.replace('px', '')) || 0;

      window.scrollTo({
        top: section.current.offsetTop - offset,
        behavior: 'smooth',
      });

      // Allow observer after scroll completes
      setTimeout(() => {
        navigate(window.location.pathname, {
          replace: true,
          preventScrollReset: true,
        });
      }, 1000);
    }
  }, [hash]);

  return (
    <section className="about-our-standards" ref={section}>
      <div className="about-text-container">
        <p className="intro-heading">{data.title}</p>
        <div className="bottom-section-text-container">
          <div style={{marginBottom: '1rem'}}>
            <PortableText value={data.blurb} />
          </div>
          <Link
            to={'/pages/faq'}
            className="intro-text"
            style={{
              color: '#3c0707',
              borderBottom: '1px solid #3c0707',
            }}
          >
            Learn More →
          </Link>
        </div>

        <img src={monogram} alt="monogram: BNY" />
      </div>
      <div className="our-standards-about-images-container">
        <div className="our-standards-about-square-images-container">
          {data.squareImages.map((image, index) => (
            <img key={index} src={image.asset.url} alt="" />
          ))}
        </div>
        <div className="our-standards-about-primary-image-container">
          <img src={data.primaryImage.asset.url} alt="" />
        </div>
      </div>
    </section>
  );
}
function OurTeam({data}) {
  return (
    <section className="about-our-team-section">
      <div>
        <p className="intro-heading">{data.title}</p>
        <div className="team-member-container">
          {data.ourTeam.map((member) => (
            <TeamMember data={member} key={member._key} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMember({data}) {
  return (
    <div className="team-member">
      <div className="team-member-headshot-container">
        <img src={data.image.asset.url} alt="" />
      </div>
      <div className="team-member-text-container">
        <div>
          <p>{`${data.name}, ${data.title}`}</p>
          <p>{data.petInfo}</p>
        </div>
        <p>{data.shortBio}</p>
      </div>
    </div>
  );
}
