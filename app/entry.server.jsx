import {RemixServer} from '@remix-run/react';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const policy = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    connectSrc: [
      "'self'",
      'https://cdn.sanity.io',
      'https://apicdn.sanity.io',
      'https://3c8olga9.apicdn.sanity.io',
      'http://localhost:3000',
      'ws://localhost:*',
      'ws://127.0.0.1:*',
      'ws://*.tryhydrogen.dev:*',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://googleads.g.doubleclick.net',
      'https://*.doubleclick.net',
      'https://www.google.com',
      'https://www.googleadservices.com',
      'https://tpc.googlesyndication.com',
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://connect.facebook.net',
      'https://*.facebook.net',
      'https://*.facebook.com',
      'https://graph.facebook.com',
      'https://judge.me',
      'https://*.judge.me',
      'https://cdnwidget.judge.me',
      'https://cache.judge.me',
      'https://s3.amazonaws.com/me.judge.temp-files',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://cdn.sanity.io',
      'https://d3k81ch9hvuctc.cloudfront.net',
      'https://www.google.com',
      'https://www.googleadservices.com',
      'https://www.googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://*.judge.me',
      'https://judgeme-public-images.imgix.net',
      'https://judgeme.imgix.net',
      'https://www.facebook.com',
      'https://*.facebook.com',
    ],
    frameSrc: [
      "'self'",
      'https://www.facebook.com',
      'https://*.facebook.com',
      'https://td.doubleclick.net',
      'https://*.doubleclick.net',
      'https://*.google.com',
      'https://*.googleadservices.com',
      'https://googleads.g.doubleclick.net',
      'https://www.googleadservices.com',
      'https://tpc.googlesyndication.com',
      'https://*.googlesyndication.com',
      'https://www.googletagmanager.com',
      'https://googleads.g.doubleclick.net',
      'https://www.googleadservices.com',
      'https://tpc.googlesyndication.com',
      'https://*.googlesyndication.com',
    ],
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'",
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://www.googletagmanager.com',
      'https://www.googleads.g.doubleclick.net',
      'https://googleads.g.doubleclick.net',
      'https://www.googleadservices.com',
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
      'https://cdnwidget.judge.me',
    ],
    scriptSrcElem: [
      "'self'",
      "'unsafe-inline'",
      'https://static.klaviyo.com',
      'https://static-tracking.klaviyo.com',
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
      'https://cdn.shopifycdn.net',
      'https://shopify.dev',
      'https://shopify.com',
      'https://www.googletagmanager.com',
      'https://googleads.g.doubleclick.net',
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
      'https://cdnwidget.judge.me',
      'https://code.jquery.com',
      'https://connect.facebook.net',
      'https://*.facebook.net',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.shopify.com',
      'https://static.klaviyo.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
    ],
    styleSrcElem: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.shopify.com',
      'https://static-tracking.klaviyo.com',
      'https://static.klaviyo.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
    ],
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'https://cdn.judge.me',
      'https://*.judge.me',
    ],
  });

  const {nonce, NonceProvider, header} = policy;

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} nonce={nonce} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
