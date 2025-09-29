import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useState, useEffect} from 'react';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const secondImage = product.images?.nodes?.[1];
  const isPreorder = product.tags?.includes('preorder');

  const price = product.priceRange.minVariantPrice;
  const priceWithoutDecimals = Math.floor(parseFloat(price.amount));
  const plpDescription = product.plpDescription?.value;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 499);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="product-item-image-wrapper">
        <Image
          alt={image?.altText || product.title}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
          className="product-image primary-image"
        />
        {secondImage && (
          <Image
            alt={secondImage.altText || product.title}
            aspectRatio="1/1"
            data={secondImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="product-image secondary-image"
          />
        )}

        {isMobile ? (
          // Mobile layout
          <>
            <div className="product-item-info">
              <div>
                <p>{product.title}</p>
                <p>${priceWithoutDecimals}</p>
              </div>
              {isPreorder && (
                <div className="product-preorder-badge">Preorder</div>
              )}
            </div>
            {plpDescription && (
              <div className="product-plp-description">
                {plpDescription.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </>
        ) : (
          // Desktop layout
          <>
            <div className="product-item-info">
              <p>{product.title}</p>
              <p>${priceWithoutDecimals}</p>
            </div>
            {isPreorder && (
              <div className="product-preorder-badge">Preorder</div>
            )}
            {plpDescription && (
              <div className="product-plp-description">
                {plpDescription.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
