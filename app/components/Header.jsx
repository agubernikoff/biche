import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import Wordmark from '~/assets/03_Wordmark';
import {useState, useEffect} from 'react';
import mobileBanner from '../assets/mobile-header-banner.png';

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
          <div className="header-spacer" />
          <p>{settings.menu.callout}</p>
          {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
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
      {viewport === 'mobile' ? (
        <hr style={{color: '1px solid #e9e9e9'}} />
      ) : null}
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
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item._key}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.reference?.title || item.title}
          </NavLink>
        );
      })}
      {viewport === 'mobile' && (
        <>
          <div className="header-menu-extra">
            <hr />
            <NavLink
              className="header-menu-item"
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to="/contact"
            >
              Contact
            </NavLink>
            <NavLink
              className="header-menu-item"
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to="/faq"
            >
              FAQ
            </NavLink>
            <NavLink
              className="header-menu-item"
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to="/policies/shipping-policy"
            >
              Shipping &amp; Returns
            </NavLink>
            <hr />
            <div>
              <label htmlFor="newsletter-email">Newsletter</label>
              <div className="newsletter-signup">
                <input type="email" id="newsletter-email" placeholder="Email" />
                <button type="submit">Sign Up →</button>
              </div>
            </div>
            <hr />
            <div className="mobile-preview">
              <img src={mobileBanner} alt="Drop preview 1" />
            </div>
            <p>Drop 01: Cloud Cleanser and Après Oil coming soon!</p>
          </div>
        </>
      )}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
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
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
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
    textDecoration: isActive ? 'underline' : 'none',
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
