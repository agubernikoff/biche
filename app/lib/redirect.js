import {redirect} from '@shopify/remix-oxygen';

/**
 * @param {Request} request
 * @param {...Array<{
 *     handle: string;
 *     data: {handle: string} & unknown;
 *   }>} [localizedResources]
 */
export function redirectIfHandleIsLocalized(request, ...localizedResources) {
  const url = new URL(request.url);
  let shouldRedirect = false;

  localizedResources.forEach(({handle, data}) => {
    if (handle !== data.handle && handle !== data.slug.current) {
      url.pathname = url.pathname.replace(
        handle,
        data.handle || data.slug.current,
      );
      shouldRedirect = true;
    }
  });

  if (shouldRedirect) {
    throw redirect(url.toString());
  }
}
