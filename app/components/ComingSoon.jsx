import React, {useState, useEffect} from 'react';
import {sanityClient} from '../sanity/sanityClient';
import {COMING_SOON_QUERY} from '../sanity/queries/comingSoonQuery';

export default function ComingSoon() {
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  function subscribe() {
    if (!email) {
      setError('please enter a valid email');
      setTimeout(() => {
        setError();
      }, 1500);
      return;
    }

    const payload = {
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
      'https://a.klaviyo.com/client/subscriptions/?company_id=Ws4Y78',
      requestOptions,
    ).then((result) => {
      if (result.ok) {
        setSuccess('Thank you for signing up!');
      } else {
        result.json().then((data) => {
          setError(data.errors[0].detail);
          setTimeout(() => {
            setError();
          }, 1500);
        });
      }
    });
  }

  return (
    <>
      <div className="coming-soon">
        <section className={`hero-section ${isMobile ? 'mobile' : ''}`}>
          <div className="hero-image left-image">
            <img src={`${data.leftImage?.url}/?w=900`} alt="Left visual" />
          </div>
          <HeroLogo url={`${data.logo?.url}/?w=900`} />
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
            {success ? (
              <p className="intro-text">{success}</p>
            ) : (
              <form
                className="email-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  subscribe();
                }}
              >
                <input
                  placeholder="Email"
                  className="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="signup-button">
                  Sign Up →
                </button>
              </form>
            )}
            <p
              style={{
                position: 'absolute',
                bottom: '-2rem',
                left: '.5rem',
                width: '100%',
                textAlign: 'left',
              }}
            >
              {error}
            </p>
          </div>
        </section>

        <section className="founder-section">
          <div className="founder-image">
            <img src={`${data.founderImage?.url}/?w=900`} alt="Founder" />
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
    if (url && url.includes('.svg')) {
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
