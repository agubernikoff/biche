import {sanityClient} from '~/sanity/sanityClient';

const EDITORIAL_SITEMAP_QUERY = `*[_type == "editorial" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  _updatedAt,
  publishedAt
} | order(publishedAt desc)`;

export async function loader({request}) {
  const articles = await sanityClient.fetch(EDITORIAL_SITEMAP_QUERY);
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles
  .map(
    (article) => `
  <url>
    <loc>${baseUrl}/editorial/${article.slug}</loc>
    <lastmod>${new Date(article._updatedAt || article.publishedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
