import {useState} from 'react';

export default function Newsletter({data}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function subscribe() {
    if (!email) {
      setError('Please enter a valid email.');
      setTimeout(() => {
        setError('');
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

    const requestOptions = {
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
        setSuccess('Thank you for subscribing!');
        if (
          typeof window !== 'undefined' &&
          typeof window.gtag === 'function'
        ) {
          window.gtag('event', 'conversion', {
            send_to: 'AW-17280171207/09vPCNZ6t-gaEME56a9A',
          });
        }
      } else {
        result.json().then((data) => {
          setError(data.errors[0].detail);
          setTimeout(() => {
            setError('');
          }, 1500);
        });
      }
    });
  }

  return (
    <div className="footer-newlsetter">
      <p>{data.title}</p>
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
            placeholder={data.placeholder}
            className="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="signup-button">
            {data.submitText}
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
  );
}
