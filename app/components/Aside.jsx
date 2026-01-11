import {createContext, useContext, useEffect, useState} from 'react';
import {useLocation} from '@remix-run/react';
import Wordmark from '~/assets/03_Wordmark';
import logo from '../assets/Isolation_Mode.png';
import xlogo from '../assets/Menu.png';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside" onClick={close} />
      <aside id={type}>
        <header>
          <button className="close reset" onClick={close} aria-label="Close">
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
          </button>
          <div className="header-spacer" />
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  const location = useLocation();

  useEffect(() => {
    setType('closed');
  }, [location]);

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
