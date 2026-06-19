import {json} from '@shopify/remix-oxygen';

const JUDGE_ME_TOKEN = 'QDf8nyEcTy_oElEh-TNwUOiBl68';
const SHOP_DOMAIN = '9fi6u1-st.myshopify.com';

function parseWidget(html) {
  const totalMatch = html.match(/data-number-of-reviews='(\d+)'/);
  const avgMatch = html.match(/data-average-rating='([\d.]+)'/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
  const average = avgMatch ? parseFloat(avgMatch[1]) : 0;

  const chunks = html.split("<div class='jdgm-rev jdgm-divider-top'").slice(1);

  const reviews = chunks.map((chunk) => {
    const idMatch = chunk.match(/data-review-id='([^']+)'/);
    const verifiedMatch = chunk.match(/data-verified-buyer='([^']+)'/);
    const ratingMatch = chunk.match(/data-score='(\d+)'/);
    const timestampMatch = chunk.match(/data-content='([^']+)'/);
    const authorMatch = chunk.match(
      /<span class='jdgm-rev__author'>([^<]+)<\/span>/,
    );
    const bodyMatch = chunk.match(
      /<div class='jdgm-rev__body'>([\s\S]*?)<\/div>/,
    );
    const titleMatch = chunk.match(/<b class='jdgm-rev__title'>([^<]*)<\/b>/);

    const customFields = [];
    const cfPattern =
      /<b class='jdgm-rev__cf-ans__title'>([^<]+)<\/b>\s*<span class='jdgm-rev__cf-ans__value'>([^<]+)<\/span>/g;
    let cfMatch;
    while ((cfMatch = cfPattern.exec(chunk)) !== null) {
      customFields.push({label: cfMatch[1].trim(), value: cfMatch[2].trim()});
    }

    const media = [];

    const picPattern =
      /jdgm-rev__pic-link[^>]*href='([^']+)'[\s\S]*?data-src='([^']+)'/g;
    let picMatch;
    while ((picMatch = picPattern.exec(chunk)) !== null) {
      media.push({
        type: 'image',
        full: picMatch[1].replace(/&amp;/g, '&'),
        thumb: picMatch[2].replace(/&amp;/g, '&'),
      });
    }

    const vidPattern = /data-external-id=([^\s>'"]+)/g;
    let vidMatch;
    while ((vidMatch = vidPattern.exec(chunk)) !== null) {
      media.push({type: 'video', externalId: vidMatch[1]});
    }

    const ytPattern = /jdgm-yt-video[^>]*data-id="([^"]+)"/g;
    let ytMatch;
    while ((ytMatch = ytPattern.exec(chunk)) !== null) {
      media.push({
        type: 'youtube',
        id: ytMatch[1],
        thumb: `https://img.youtube.com/vi/${ytMatch[1]}/sddefault.jpg`,
      });
    }

    return {
      id: idMatch?.[1] || '',
      verified: verifiedMatch?.[1] === 'true',
      rating: ratingMatch ? parseInt(ratingMatch[1], 10) : 0,
      created_at: timestampMatch?.[1] || '',
      author: authorMatch?.[1]?.trim() || 'Anonymous',
      body: bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '').trim() : '',
      title: titleMatch ? titleMatch[1].trim() : '',
      customFields,
      media,
    };
  });

  return {reviews, total, average};
}

export async function loader({request}) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('id');
  const page = url.searchParams.get('page') || '1';
  const perPage = url.searchParams.get('per_page') || '5';

  if (!productId) {
    return json({error: 'Missing id'}, {status: 400});
  }

  const apiUrl = `https://api.judge.me/api/v1/widgets/product_review?shop_domain=${SHOP_DOMAIN}&external_id=${productId}&page=${page}&per_page=${perPage}`;

  const response = await fetch(apiUrl, {
    headers: {'X-Api-Token': JUDGE_ME_TOKEN},
  });

  if (!response.ok) {
    return json(
      {error: 'Failed to fetch reviews', status: response.status},
      {status: response.status},
    );
  }

  const data = await response.json();
  return json(parseWidget(data.widget));
}
