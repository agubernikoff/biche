import {useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductImage({images}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!images || images.length === 0) return null;

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX > halfWidth) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="product-image-container">
      <div className="product-image-wrapper" onClick={handleImageClick}>
        <Image
          data={images[currentIndex]}
          aspectRatio="1/1"
          sizes="(min-width: 45em) 50vw, 100vw"
        />
        {mounted && (
          <div className="product-image-indicator">
            {images.map((_, index) => (
              <span
                key={index}
                className={index === currentIndex ? 'active' : ''}
              >
                {index + 1}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
