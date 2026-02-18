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

function parseRichText(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    const renderNode = (node) => {
      if (node.type === 'root') {
        return node.children.map(renderNode).join('');
      }

      if (node.type === 'paragraph') {
        const content = node.children
          .map((child) => {
            if (child.type === 'text') {
              let text = child.value;
              // Convert line breaks to <br> tags
              text = text.replace(/\n/g, '<br>');
              if (child.bold) text = `<strong>${text}</strong>`;
              if (child.italic) text = `<em>${text}</em>`;
              return text;
            }
            return '';
          })
          .join('');
        return `<p>${content}</p>`;
      }

      if (node.type === 'list') {
        const listType = node.listType === 'ordered' ? 'ol' : 'ul';
        const items = node.children
          .map((item) => {
            const content = item.children
              .map((child) => {
                if (child.type === 'text') {
                  let text = child.value;
                  if (child.bold) text = `<strong>${text}</strong>`;
                  if (child.italic) text = `<em>${text}</em>`;
                  return text;
                }
                return '';
              })
              .join('');
            return `<li>${content}</li>`;
          })
          .join('');
        return `<${listType}>${items}</${listType}>`;
      }

      if (node.type === 'heading') {
        const level = node.level || 3;
        const content = node.children
          .map((child) => {
            if (child.type === 'text') {
              return child.value;
            }
            return '';
          })
          .join('');
        return `<h${level}>${content}</h${level}>`;
      }

      return '';
    };

    return renderNode(parsed);
  } catch (e) {
    console.error('Error parsing rich text:', e);
    return value;
  }
}

export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const secondImage = product.images?.nodes?.[1];
  const productBadgeText = product.productBadge?.value;

  const price = product.priceRange.minVariantPrice;
  const priceWithoutDecimals = Math.floor(parseFloat(price.amount));
  const plpDescription = parseRichText(product.descriptionPLP?.value);

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
      <div
        className={`product-item-image-wrapper ${secondImage ? 'has-secondary-image' : ''}`}
      >
        <Image
          alt={image?.altText || product.title}
          aspectRatio="1/1"
          data={image}
          loading={loading}
          sizes="(min-width: 45em) 50vw, 100vw"
          className="product-image primary-image"
        />
        {secondImage && (
          <Image
            alt={secondImage.altText || product.title}
            aspectRatio="1/1"
            data={secondImage}
            loading={loading}
            sizes="(min-width: 45em) 50vw, 100vw"
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
              {productBadgeText && (
                <div className="product-preorder-badge">{productBadgeText}</div>
              )}
            </div>
            {plpDescription && (
              <div
                className="product-plp-description"
                dangerouslySetInnerHTML={{__html: plpDescription}}
              />
            )}
          </>
        ) : (
          // Desktop layout
          <>
            <div className="product-item-info">
              <p>{product.title}</p>
              <p>${priceWithoutDecimals}</p>
            </div>
            {productBadgeText && (
              <div className="product-preorder-badge">{productBadgeText}</div>
            )}
            {plpDescription && (
              <div
                className="product-plp-description"
                dangerouslySetInnerHTML={{__html: plpDescription}}
              />
            )}
          </>
        )}
      </div>
    </Link>
  );
}
