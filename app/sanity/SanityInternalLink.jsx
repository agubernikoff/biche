import {Link} from '@remix-run/react';
import React from 'react';

function SanityInternalLink({value, children}) {
  return (
    <Link
      to={`/${value.type}s/${value.slug}`}
      className="intro-text"
      style={{
        color: '#3c0707',
        padding: '.5rem',
      }}
    >
      {children[0]}
    </Link>
  );
}

export default SanityInternalLink;
