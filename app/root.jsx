import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  NavLink,
} from '@remix-run/react';
import {useEffect} from 'react';
import favicon from '~/assets/favicon.png';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';
import {sanityClient} from './sanity/sanityClient';
import {SETTINGS_QUERY} from './sanity/queries/comingSoonQuery';
import {Script} from '@shopify/hydrogen';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

// Add this meta function for site-wide defaults
export const meta = () => {
  return [
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
    {
      property: 'og:type',
      content: 'website',
    },
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
      storeDomain: env.PUBLIC_STORE_DOMAIN,
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
    }),
    selectedLocale: args.context.storefront.i18n,
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: true,
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

async function loadCriticalData({context}) {
  const {storefront} = context;
  const [header, settings] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {headerMenuHandle: 'main-menu'},
    }),
    sanityClient.fetch(SETTINGS_QUERY),
  ]);

  return {
    header,
    comingSoon: process.env.NODE_ENV === 'development' ? false : true,
    settings,
  };
}

function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {footerMenuHandle: 'footer'},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  useEffect(() => {
    // GTM Script
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-PD4QRSV3');

    // Google Ads Script
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src =
      'https://www.googletagmanager.com/gtag/js?id=AW-17280171207';
    document.head.appendChild(gtagScript);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Removed the hardcoded og:description meta tag - now handled by meta() function */}
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'AW-17280171207');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PD4QRSV3"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}
          ></iframe>
        </noscript>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
            <Script
              async
              type="text/javascript"
              src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=Ws4Y78"
            />
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <div className="route-error">
      <h1>404</h1>
      <p>We're sorry, the page you're looking for doesn't exist.</p>
      <NavLink to="/" style={{textDecoration: 'underline'}} prefetch="intent">
        Return home
      </NavLink>
    </div>
  );
}

export function CatchBoundary() {
  return (
    <div className="route-error">
      <h1>404</h1>
      <p>We're sorry, the page you're looking for doesn't exist.</p>
      <NavLink to="/" style={{textDecoration: 'underline'}} prefetch="intent">
        Return home
      </NavLink>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@remix-run/react').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
