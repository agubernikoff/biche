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
  if (!data?.article) {
    return [{title: 'Editorial | Not Found'}];
  }

  const {article} = data;
  const seoTitle = article.seo?.title ?? article.title ?? 'Editorial';
  const seoDescription = article.seo?.description ?? '';
  const seoImage =
    article.seo?.image?.asset?.url ?? article.hero?.asset?.url ?? '';
  const canonicalUrl = `https://yourdomain.com/editorial/${article.slug}`;

  return [
    // Standard
    {title: seoTitle},
    {name: 'description', content: seoDescription},

    // Canonical
    {tagName: 'link', rel: 'canonical', href: canonicalUrl},

    // Open Graph
    {property: 'og:title', content: seoTitle},
    {property: 'og:description', content: seoDescription},
    {property: 'og:image', content: seoImage},
    {property: 'og:type', content: 'article'},
    {property: 'og:url', content: canonicalUrl},

    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: seoTitle},
    {name: 'twitter:description', content: seoDescription},
    {name: 'twitter:image', content: seoImage},

    // JSON-LD Structured Data (output inline script tag)
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seoTitle,
        description: seoDescription,
        image: [seoImage],
        author: {
          '@type': 'Person',
          name: article.author?.name,
          url: article.author?.link,
        },
        datePublished: article.publishedAt,
        dateModified: article._updatedAt ?? article.publishedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      }),
    },
  ];
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
  const {articleHandle} = params;

  if (!articleHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [blog] = await Promise.all([
    sanityClient.fetch(ARTICLE_QUERY, {slug: articleHandle}),
    // Add other queries here, so that they are loaded in parallel
  ]);

  redirectIfHandleIsLocalized(request, {
    handle: articleHandle,
    data: blog[0],
  });

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
        <div />
      </NavLink>
      <div>
        <h1 className="intro-heading">{title}</h1>
        <div className="article-time-and-author">
          <p>
            <span>Written By </span>
            {author.link ? (
              <a href={author.link}>{author?.name}</a>
            ) : (
              <span>{author?.name}</span>
            )}
          </p>
          <time dateTime={article.publishedAt}>{publishedDate}</time>
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
  seo{...,image{...,asset->{...,url}}}
}`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
