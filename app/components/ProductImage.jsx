import {useState, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductImage({images}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(currentX - touchStartX.current);
    const diffY = Math.abs(currentY - (touchStartY.current ?? currentY));

    // If the user is swiping more horizontally than vertically, lock scroll
    if (diffX > diffY) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;

    if (!touchStartX.current || !touchEndX.current) return;

    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // threshold in px

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left → Next image
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right → Previous image
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }

    // reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="product-image-container">
      <div
        className="product-image-wrapper"
        onClick={handleImageClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
