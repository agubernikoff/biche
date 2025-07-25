import {Link, useLoaderData} from '@remix-run/react';
import {sanityClient} from '~/sanity/sanityClient';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: `Biche Blogs`}];
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
async function loadCriticalData({context, request}) {
  const [blogs] = await Promise.all([
    sanityClient.fetch(BLOGS_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
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

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="blogs">
      <p className="intro-heading">The Biche Community</p>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <Link
            className="blog-link"
            key={blog.slug}
            prefetch="intent"
            to={`/editorial/${blog.slug}`}
          >
            <img alt="" src={blog.hero.asset.url} />
            <div className="blog-preview-content">
              <p className="intro-heading">{blog.title}</p>
              <p>Read more</p>
            </div>
          </Link>
        ))}
        {/* {blogs.map((blog) => (
          <Link
            className="blog-link"
            key={blog.slug}
            prefetch="intent"
            to={`/editorial/${blog.slug}`}
          >
            <img alt="" src={blog.hero.asset.url} />
            <div className="blog-preview-content">
              <p>{blog.title}</p>
              <p>Read more</p>
            </div>
          </Link>
        ))}
        {blogs.map((blog) => (
          <Link
            className="blog-link"
            key={blog.slug}
            prefetch="intent"
            to={`/editorial/${blog.slug}`}
          >
            <img alt="" src={blog.hero.asset.url} />
            <div className="blog-preview-content">
              <p>{blog.title}</p>
              <p>Read more</p>
            </div>
          </Link>
        ))}
        {blogs.map((blog) => (
          <Link
            className="blog-link"
            key={blog.slug}
            prefetch="intent"
            to={`/editorial/${blog.slug}`}
          >
            <img alt="" src={blog.hero.asset.url} />
            <div className="blog-preview-content">
              <p>{blog.title}</p>
              <p>Read more</p>
            </div>
          </Link>
        ))} */}
      </div>
    </div>
  );
}

const BLOGS_QUERY = `*[_type == "editorial"] | order(_createdAt desc)[]{
  hero{...,asset->{url}},
  "slug": slug.current,
  title,
  category
}`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
