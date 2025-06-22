import {useLoaderData, useRouteLoaderData, NavLink} from '@remix-run/react';
import {PortableText} from 'node_modules/@portabletext/react/dist/index';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SANITY_PAGE_QUERY} from '~/sanity/queries/comingSoonQuery';
import {sanityClient} from '~/sanity/sanityClient';
import SanityEmailLink from '~/sanity/SanityEmailLink.jsx';
import SanityTable from '~/sanity/SanityTable.jsx';

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

  const [sanityPage] = await Promise.all([
    // context.storefront.query(PAGE_QUERY, {
    //   variables: {
    //     handle: params.handle,
    //   },
    // }),
    // Add other queries here, so that they are loaded in parallel
    sanityClient.fetch(SANITY_PAGE_QUERY, {slug: params.handle}),
  ]);

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
  const {settings} = useRouteLoaderData('root');

  return (
    <div className="page">
      <div>
        {sanityPage.hasSideNav && (
          <nav className="page-side-nav">
            {settings?.pagesSideNav?.links
              ?.filter(
                (link) =>
                  link._type === 'linkInternal' &&
                  link.reference._type === 'page',
              )
              ?.map((link) => (
                <NavLink
                  to={`/pages/${link.reference.slug}`}
                  style={activeLinkStyle}
                  className="page-subheader"
                  key={link._key}
                >
                  {link.reference.title}
                </NavLink>
              ))}
          </nav>
        )}
      </div>
      <div>
        <header>
          <h1 className="intro-heading">{sanityPage.title}</h1>
          <p
            className="page-subheader"
            style={{
              marginBottom: '6rem',
            }}
          >
            {sanityPage.subheader}
          </p>
        </header>
        <main>
          {sanityPage.dividerSections?.map((section) => (
            <DividerSection key={section._key} section={section} />
          ))}
          <div className="page-portable-text">
            <PortableText
              value={sanityPage.body}
              components={{
                marks: {linkEmail: SanityEmailLink},
                types: {table: SanityTable},
              }}
            />
          </div>
        </main>
      </div>
      {/* <main dangerouslySetInnerHTML={{__html: sanityPage.body}} /> */}
    </div>
  );
}

function DividerSection({section}) {
  return (
    <div className="divider-section">
      <p
        className="page-subheader"
        style={{
          marginBottom: '1rem',
        }}
      >
        {section.title}
      </p>
      <div className="divider-content-container">
        {section.content.map((content) => (
          <DividerSectionContent key={content._key} content={content} />
        ))}
      </div>
    </div>
  );
}

function DividerSectionContent({content}) {
  return (
    <div className="divider-content">
      <p>
        <strong>{content.title}</strong>
      </p>
      <div>
        <PortableText
          value={content.body}
          components={{marks: {linkEmail: SanityEmailLink}}}
        />
      </div>
      {content.email && (
        <a
          href={`mailto:${content.email.email}`}
          className="divider-content-email"
        >
          {content.email.email}
        </a>
      )}
    </div>
  );
}

function activeLinkStyle({isActive, isPending}) {
  return {
    // fontWeight: isActive ? 'bold' : undefined,
    // color: isPending ? 'grey' : '#C3F8F8',
    textDecoration: isActive ? 'underline' : 'none',
  };
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
