import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  const formatPrice = (priceData) => {
    if (!priceData) return null;
    const amount = Math.floor(parseFloat(priceData.amount));
    return `$${amount}`;
  };

  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? <span>{formatPrice(price)}</span> : null}
          <s>{formatPrice(compareAtPrice)}</s>
        </div>
      ) : price ? (
        <span>{formatPrice(price)}</span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
