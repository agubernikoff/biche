import {useLoaderData} from '@remix-run/react';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SANITY_PAGE_QUERY} from '~/sanity/queries/comingSoonQuery';
import {sanityClient} from '~/sanity/sanityClient';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.sanityPage.title ?? ''}`}];
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
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }
  console.log(params.handle, SANITY_PAGE_QUERY);
  const [sanityPage] = await Promise.all([
    // context.storefront.query(PAGE_QUERY, {
    //   variables: {
    //     handle: params.handle,
    //   },
    // }),
    // Add other queries here, so that they are loaded in parallel
    sanityClient.fetch(SANITY_PAGE_QUERY, {slug: params.handle}),
  ]);

  console.log(sanityPage);

  if (!sanityPage) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {
    handle: params.handle,
    data: sanityPage,
  });

  return {
    sanityPage,
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

export default function Page() {
  /** @type {LoaderReturnData} */
  const {sanityPage} = useLoaderData();

  return (
    <div className="page">
      <header>
        <h1>{sanityPage.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: sanityPage.body}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
