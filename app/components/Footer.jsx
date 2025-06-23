import {useState} from 'react';
import {NavLink} from '@remix-run/react';
import Logo from '~/assets/03_Wordmark.jsx';
import Newsletter from './Newsletter';

/**
 * @param {FooterProps}
 */
export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
  settings,
}) {
  return (
    <footer className="footer">
      <Logo color={'var(--color-balsamic)'} />
      <Newsletter data={settings.footer.newsletter} />
      <FooterMenu
        menu={settings.footer.linkColumns}
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </footer>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <div className="link-columns-container">
      {(menu || FALLBACK_FOOTER_MENU).map((column) => {
        if (!column.links || column.links.length === 0) return null;
        // if the url is internal, we strip the domain
        return (
          <nav className="footer-menu" role="navigation" key={column._key}>
            {column.links.map((link) => {
              const isExternal = link._type === 'linkExternal';
              const internalPageLink =
                link._type === 'linkInternal' && link.reference._type === 'page'
                  ? `/pages/${link.reference.slug}`
                  : null;
              return isExternal ? (
                <a
                  href={link.url}
                  key={link._key}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.text}
                </a>
              ) : (
                <NavLink
                  end
                  key={link._key}
                  prefetch="intent"
                  style={activeLinkStyle}
                  to={internalPageLink}
                >
                  {link.reference.title}
                </NavLink>
              );
            })}
          </nav>
        );
      })}
    </div>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    // fontWeight: isActive ? 'bold' : undefined,
    // color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
