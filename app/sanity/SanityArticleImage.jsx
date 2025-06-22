import {useState} from 'react';

// Barebones lazy-loaded image component
function SanityArticleImage({value}) {
  const mappedImages = value.imageFeatures.map((m) => {
    return (
      <div key={m._key} className={'sanity-article-image-container'}>
        <img
          src={`${m.image.asset.url}?auto=format&q=60`}
          alt={value.alt || ' '}
          loading="lazy"
        />
      </div>
    );
  });

  return <div className="article-images-container">{mappedImages}</div>;
}

export default SanityArticleImage;
