import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import Wordmark from '~/assets/03_Wordmark';
import {useState, useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';

/**
 * @param {HeaderProps}
 */
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  settings,
}) {
  const {shop, menu} = header;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth <= 499);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);
  return (
    <header className="header">
      <div className="backdrop">
        <div className="header-content">
          <HeaderMenuMobileToggle />
          <HeaderMenu menu={settings.menu.links} viewport="desktop" />
          <NavLink
            prefetch="intent"
            to="/"
            style={activeLinkStyle}
            end
            className="header-logo"
          >
            <Wordmark color="var(--color-balsamic)" />
          </NavLink>
          {/* <p>{settings.menu.callout}</p> */}
          <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </div>
      {/* <div className="backdrop-edge"></div> */}
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({menu, viewport}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {/* {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )} */}
      {menu.map((item) => {
        if (!item.reference?.slug && !item.path) return null;

        // if the url is internal, we strip the domain
        const url = item.reference?.slug || item.path;
        return <HeaderMenuItem url={url} item={item} close={close} />;
      })}
    </nav>
  );
}

function HeaderMenuItem({item, url, close}) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      className="header-menu-item"
      key={item._key}
      onClick={close}
      prefetch="intent"
      style={activeLinkStyle}
      to={url}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.reference?.title || item.title}
      <AnimatePresence mode="wait">
        {hovered && (
          <motion.div
            initial={{left: 0, right: '100%'}}
            animate={{left: 0, right: 0}}
            exit={{left: '100%', right: 0}}
            className="header-hover-indicator"
          />
        )}
      </AnimatePresence>
    </NavLink>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      {/* <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle /> */}
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open, close, type} = useAside();
  const isOpen = type === 'mobile';

  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => (isOpen ? close() : open('mobile'))}
    >
      <h3>
        <svg
          width="24"
          height="13"
          viewBox="0 0 24 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <motion.line
              y1="0.5"
              x2="24"
              y2="0.5"
              stroke="currentColor"
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 5.79 : 0,
              }}
              transition={{duration: 0.3, ease: 'easeInOut'}}
              style={{originX: '50%', originY: '50%'}}
            />
            <motion.line
              y1="6.28955"
              x2="24"
              y2="6.28955"
              stroke="currentColor"
              animate={{
                opacity: isOpen ? 0 : 1,
              }}
              transition={{duration: 0.2}}
            />
            <motion.line
              y1="12.0791"
              x2="24"
              y2="12.0791"
              stroke="currentColor"
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? -5.79 : 0,
              }}
              transition={{duration: 0.3, ease: 'easeInOut'}}
              style={{originX: '50%', originY: '50%'}}
            />
          </g>
        </svg>
      </h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null, inAside: boolean}}
 */
function CartBadge({count, inAside}) {
  const {open, close, type} = useAside();
  const isOpen = type === 'cart';
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        if (isOpen) close();
        else open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      className="header-menu-item"
    >
      <span
        style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isOpen && !inAside ? (
            <motion.span
              key="close"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {'Close '}
              <svg
                width="17"
                height="14"
                viewBox="0 0 17 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.48535 0.687988L8.67188 5.87451L13.8584 0.687988H16.4766L10.1338 7.02979L9.98047 7.18408L10.1338 7.3374L16.4766 13.6792H13.8584L8.67188 8.49268L3.48535 13.6792H0.867188L7.3623 7.18408L7.20898 7.02979L0.867188 0.687988H3.48535Z"
                  fill="#3C0707"
                  stroke="white"
                  strokeWidth="0.434215"
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="bag"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
            >
              {`Bag — ${count === null ? 0 : count}`}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
export function CartToggle({cart, inAside}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner inAside={inAside} />
      </Await>
    </Suspense>
  );
}

function CartBanner({inAside}) {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} inAside={inAside} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    // textDecoration: isActive ? 'underline' : 'none',
    // color: isPending ? 'grey' : '#C3F8F8',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
