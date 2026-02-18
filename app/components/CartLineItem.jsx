import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';

export function CartLineItem({layout, line}) {
  const {id, merchandise, isOptimistic} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  const hasOptions = !(
    selectedOptions.length === 1 &&
    selectedOptions[0].name === 'Title' &&
    selectedOptions[0].value === 'Default Title'
  );

  return (
    <li key={id} className="cart-line">
      {image && (
        <Image
          alt={title}
          aspectRatio="1/1"
          data={image}
          height={300}
          loading="lazy"
          width={300}
        />
      )}

      <div className="cart-line-details">
        <div className="cart-line-details-title">
          <Link to={lineItemUrl} onClick={() => layout === 'aside' && close()}>
            {product.title}
          </Link>
          {/* Price shown inline for aside, moved to subtotal column for page */}
          {layout === 'aside' && (
            <ProductPrice price={line?.cost?.totalAmount} />
          )}
        </div>

        {hasOptions && (
          <ul>
            {selectedOptions.map((option) => (
              <li key={option.name}>
                <small>
                  {option.name}: {option.value}
                </small>
              </li>
            ))}
          </ul>
        )}

        <CartLineQuantity line={line} layout={layout} />
      </div>

      {/* Subtotal column — page layout only */}
      {layout === 'page' && (
        <div className="cart-line-subtotal">
          <ProductPrice price={line?.cost?.totalAmount} />
          <CartLineRemoveButton lineIds={[id]} disabled={!!isOptimistic} />
        </div>
      )}
    </li>
  );
}

function CartLineQuantity({line, layout}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <div className="cart-line-quantity-container">
        <p>QTY:</p>
        <div className="cart-line-quantity">
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || !!isOptimistic}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <span>&#8722;</span>
            </button>
          </CartLineUpdateButton>
          <p>{quantity}</p>
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              aria-label="Increase quantity"
              disabled={!!isOptimistic}
              name="increase-quantity"
              value={nextQuantity}
            >
              <span>&#43;</span>
            </button>
          </CartLineUpdateButton>
        </div>
      </div>

      {/* Remove button lives here for aside, in subtotal column for page */}
      {layout !== 'page' && (
        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      )}
    </>
  );
}

function CartLineRemoveButton({lineIds, disabled}) {
  const [hovered, setHovered] = useState(false);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="cart-line-remove"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Remove
        <Svg />
        <AnimatePresence mode="wait">
          {hovered && (
            <motion.div
              initial={{left: 0, right: '100%'}}
              animate={{left: 0, right: 0}}
              exit={{left: '100%', right: 0}}
              className="cart-line-remove-hover-indicator"
            />
          )}
        </AnimatePresence>
      </button>
    </CartForm>
  );
}

function Svg() {
  return (
    <svg
      width="15"
      height="14"
      viewBox="0 0 15 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M4.4269 0.350129C4.40716 0.35104 4.38832 0.359243 4.37465 0.373218C4.35977 0.3878 4.35156 0.407546 4.35156 0.428204C4.35156 0.448861 4.35977 0.468912 4.37465 0.483494L7.74097 3.85042L4.37465 7.21704C4.35977 7.23162 4.35156 7.25136 4.35156 7.27202C4.35156 7.29268 4.35977 7.31243 4.37465 7.32731C4.38923 7.3419 4.40898 7.3501 4.42964 7.3501C4.4503 7.3501 4.47004 7.3419 4.48462 7.32731L7.85125 3.9607L11.2185 7.32731C11.2331 7.3419 11.2528 7.3501 11.2735 7.3501C11.2941 7.3501 11.3139 7.3419 11.3285 7.32731C11.3434 7.31243 11.3516 7.29268 11.3516 7.27202C11.3516 7.25136 11.3434 7.23162 11.3285 7.21704L7.96154 3.85042L11.3285 0.483494C11.3434 0.468912 11.3516 0.448862 11.3516 0.428204C11.3516 0.407546 11.3434 0.3878 11.3285 0.373218C11.3139 0.358636 11.2941 0.350129 11.2735 0.350129C11.2528 0.350129 11.2331 0.358636 11.2185 0.373218L7.85125 3.74014L4.48462 0.373218C4.46943 0.357724 4.44847 0.349522 4.4269 0.350129Z"
          fill="#C3F8F8"
        />
        <path
          d="M4.4269 0.350129C4.40716 0.35104 4.38832 0.359243 4.37465 0.373218C4.35977 0.3878 4.35156 0.407546 4.35156 0.428204C4.35156 0.448861 4.35977 0.468912 4.37465 0.483494L7.74097 3.85042L4.37465 7.21704C4.35977 7.23162 4.35156 7.25136 4.35156 7.27202C4.35156 7.29268 4.35977 7.31243 4.37465 7.32731C4.38923 7.3419 4.40898 7.3501 4.42964 7.3501C4.4503 7.3501 4.47004 7.3419 4.48462 7.32731L7.85125 3.9607L11.2185 7.32731C11.2331 7.3419 11.2528 7.3501 11.2735 7.3501C11.2941 7.3501 11.3139 7.3419 11.3285 7.32731C11.3434 7.31243 11.3516 7.29268 11.3516 7.27202C11.3516 7.25136 11.3434 7.23162 11.3285 7.21704L7.96154 3.85042L11.3285 0.483494C11.3434 0.468912 11.3516 0.448862 11.3516 0.428204C11.3516 0.407546 11.3434 0.3878 11.3285 0.373218C11.3139 0.358636 11.2941 0.350129 11.2735 0.350129C11.2528 0.350129 11.2331 0.358636 11.2185 0.373218L7.85125 3.74014L4.48462 0.373218C4.46943 0.357724 4.44847 0.349522 4.4269 0.350129Z"
          stroke="#C3F8F8"
          strokeWidth="0.7"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_392_8678"
          x="0"
          y="0"
          width="15.7031"
          height="15.7002"
          filterUnits="userSpaceOnUse"
        >
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_392_8678"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_392_8678"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
