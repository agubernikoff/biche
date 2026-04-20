import {PortableText} from '@portabletext/react';
import React from 'react';

function SanityGrid({value, children}) {
  return (
    <div className="sanity-grid">
      {value?.items.map((item) => (
        <SanityGridItem key={item._key} value={item} />
      ))}
    </div>
  );
}

function SanityGridItem({value}) {
  return (
    <a
      className="sanity-grid-item"
      href={value?.link?.url}
      rel="noreferrer"
      target="_blank"
    >
      <h3>{value.title}</h3>
      <PortableText value={value.body} />
    </a>
  );
}

export default SanityGrid;
