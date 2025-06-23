import {useLoaderData, NavLink} from '@remix-run/react';
import {PortableText} from '@portabletext/react';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {sanityClient} from '~/sanity/sanityClient';
import SanityEmailLink from '~/sanity/SanityEmailLink';
import SanityExternalLink from '~/sanity/SanityExternalLink';
import SanityTable from '~/sanity/SanityTable';
import SanityArticleImage from '~/sanity/SanityArticleImage';
import SanityQA from '~/sanity/SanityQA';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.article.title ?? ''} article`}];
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [blog] = await Promise.all([
    sanityClient.fetch(ARTICLE_QUERY, {slug: articleHandle}),
    // Add other queries here, so that they are loaded in parallel
  ]);

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog[0],
    },
    {
      handle: blogHandle,
      data: blog[0],
    },
  );

  return {article: blog[0]};
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

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article} = useLoaderData();
  const {title, category, hero, body, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(article._createdAt))
    .replace(/\//g, '-');

  return (
    <div className="article">
      <NavLink to="/editorial" className="back-to-articles">
        ← Back to articles
      </NavLink>
      <div>
        <p className="intro-heading">
          {category}:
          <br />
          {title}
        </p>
        <div className="article-time-and-author">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
          <p>
            <span>Written By </span>
            {author.link ? (
              <a href={author.link.url}>{author?.name}</a>
            ) : (
              <span>{author?.name}</span>
            )}
          </p>
        </div>
      </div>

      {hero && (
        <div className="article-hero-container">
          <img alt="" src={hero.asset.url} />
        </div>
      )}
      <div className="article-body">
        <PortableText
          value={body}
          components={{
            marks: {
              linkEmail: SanityEmailLink,
              linkExternal: SanityExternalLink,
            },
            types: {
              table: SanityTable,
              images: SanityArticleImage,
              questionsAnswers: SanityQA,
            },
          }}
        />
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `*[_type == "editorial" && slug.current == $slug][]{
  ...,
  hero{...,asset->{url}},
  "slug": slug.current,
  body[]{...,_type == "images" => {...,imageFeatures[]{...,image{asset->{url}}}}},
}`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
