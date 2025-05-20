import React, {useState, useEffect} from 'react';
import {sanityClient} from '../sanity/sanityClient';
import {COMING_SOON_QUERY} from '../sanity/queries/comingSoonQuery';

export default function ComingSoon() {
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 499px)');

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();

    mediaQuery.addEventListener('change', handleResize);

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    sanityClient.fetch(COMING_SOON_QUERY).then(setData).catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <>
      <div className="coming-soon">
        <section className={`hero-section ${isMobile ? 'mobile' : ''}`}>
          <div className="hero-image left-image">
            <img src={data.leftImage?.url} alt="Left visual" />
          </div>
          <HeroLogo url={data.logo?.url} />
          <div className="hero-image right-image">
            <img src={data.rightImage?.url} alt="Right visual" />
          </div>
        </section>

        <section className="intro-section">
          <div className="intro-left">
            <p className="intro-heading">{data.heroTitle}</p>
            <p className="intro-text">{data.introText}</p>
          </div>
          <div className="intro-right">
            <p className="launch-message">{data.launchMessage}</p>
            <form className="email-form">
              <input type="email" placeholder="Email" className="email-input" />
              <button type="submit" className="signup-button">
                Sign Up →
              </button>
            </form>
          </div>
        </section>

        <section className="founder-section">
          <div className="founder-image">
            <img src={data.founderImage?.url} alt="Founder" />
          </div>
          <div className="founder-quote">
            <p className="quote-text">{data.quote}</p>
            <p className="quote-author">{data.author}</p>
          </div>
        </section>
      </div>
      {data.monogramImage?.url && (
        <div className="monogram-container">
          <img
            src={data.monogramImage.url}
            alt="Monogram"
            className="monogram-image"
          />
        </div>
      )}
    </>
  );
}

function HeroLogo({url}) {
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    console.log('Logo URL:', url);
    if (url && url.endsWith('.svg')) {
      fetch(url)
        .then((res) => res.text())
        .then(setSvg)
        .catch(console.error);
    }
  }, [url]);

  return (
    <div
      className="hero-logo"
      dangerouslySetInnerHTML={{
        __html: svg?.replace(/fill="[^"]*"/g, ''),
      }}
      style={{color: 'white'}}
    />
  );
}
