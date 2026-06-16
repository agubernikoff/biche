import {useState, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductImage({images}) {
  const [imageIndex, setImageIndex] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    let timer;
    if (trackRef.current) {
      timer = setTimeout(() => (trackRef.current.scrollLeft = 0), 300);
    }
    return () => clearTimeout(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  function handleScroll(scrollWidth, scrollLeft) {
    const widthOfAnImage = scrollWidth / images.length;
    const dividend = scrollLeft / widthOfAnImage;
    const rounded = parseFloat((scrollLeft / widthOfAnImage).toFixed(0));

    if (Math.abs(dividend - rounded) < 0.01) setImageIndex(rounded);
  }

  const mappedIndicators =
    images.length > 1
      ? images.map((e, i) => (
          <div
            key={e.id}
            className="circle"
            style={{
              background: 'var(--color-balsamic)',
              opacity: i === imageIndex ? 1 : 0.33,
              height: '6px',
              width: '6px',
              borderRadius: '4px',
            }}
          ></div>
        ))
      : null;

  return (
    <div className="product-image-container">
      <div
        ref={trackRef}
        className="product-image-track"
        onScroll={(e) =>
          handleScroll(e.target.scrollWidth, e.target.scrollLeft)
        }
      >
        {images?.map((image) => (
          <div className="product-image-wrapper" key={image.id}>
            <Image src={image.url} alt={image.altText} />
          </div>
        ))}
      </div>
      <div className="mapped-indicators">{mappedIndicators}</div>
    </div>
  );
}
