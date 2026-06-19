import {useState, useEffect, useRef} from 'react';
import {useFetcher} from '@remix-run/react';

const PER_PAGE = 5;

export function ReviewGallery({productId}) {
  const fetcher = useFetcher();
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState(null); // {images, index}
  const galleryRef = useRef(null);
  const shouldScrollRef = useRef(false);

  const {load} = fetcher;
  useEffect(() => {
    load(`/api/reviews?id=${productId}&page=${page}&per_page=${PER_PAGE}`);
  }, [productId, page, load]);

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && shouldScrollRef.current) {
      const el = galleryRef.current;
      if (el) {
        const headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-height',
          ),
          10,
        );
        const top =
          el.getBoundingClientRect().top + window.scrollY - (headerHeight || 0);
        window.scrollTo({top, behavior: 'smooth'});
      }
      shouldScrollRef.current = false;
    }
  }, [fetcher.state, fetcher.data]);

  const reviews = fetcher.data?.reviews || [];
  const total = fetcher.data?.total || 0;
  const totalPages = Math.ceil(total / PER_PAGE);
  const loading = fetcher.state !== 'idle';

  const handlePageChange = (next) => {
    shouldScrollRef.current = true;
    setPage(next);
  };

  const openLightbox = (images, index) => setLightbox({images, index});
  const closeLightbox = () => setLightbox(null);
  const lightboxNext = () =>
    setLightbox((l) => ({...l, index: (l.index + 1) % l.images.length}));
  const lightboxPrev = () =>
    setLightbox((l) => ({
      ...l,
      index: (l.index - 1 + l.images.length) % l.images.length,
    }));

  if (!loading && reviews.length === 0 && fetcher.data) return null;

  return (
    <div className="review-gallery" ref={galleryRef}>
      {loading || !fetcher.data ? (
        <div className="review-gallery__loading">
          {[...Array(PER_PAGE)].map((_, i) => (
            <div key={i} className="review-card review-card--skeleton" />
          ))}
        </div>
      ) : (
        <>
          <div className="review-gallery__list">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onMediaClick={openLightbox}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="review-gallery__pagination">
              <button
                className="review-gallery__page-btn"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                aria-label="Previous page"
              >
                ←
              </button>
              <span className="review-gallery__page-info">
                {page} / {totalPages}
              </span>
              <button
                className="review-gallery__page-btn"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onNext={lightboxNext}
          onPrev={lightboxPrev}
        />
      )}
    </div>
  );
}

function StarRating({rating}) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`review-star ${n <= rating ? 'filled' : ''}`}
        ></span>
      ))}
    </div>
  );
}

function ReviewCard({review, onMediaClick}) {
  const date = new Date(
    review.created_at.replace(' ', 'T').replace(' UTC', 'Z'),
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="review-card">
      <div className="review-header">
        <StarRating rating={review.rating} />
        <span className="review-card__date">{date}</span>
        <span className="review-card__author">
          {review.author}
          {review.verified && (
            <span className="review-card__verified">Verified</span>
          )}
        </span>
      </div>
      {review.title && <p className="review-card__title">{review.title}</p>}
      {review.body && <p className="review-card__body">{review.body}</p>}
      {review.customFields?.map((cf) => (
        <p key={cf.label} className="review-card__custom-field">
          <span className="review-card__custom-field-label">{cf.label}</span>
          {cf.value}
        </p>
      ))}
      {review.media?.length > 0 && (
        <div className="review-card__pictures">
          {review.media.map((item, i) => (
            <button
              key={item.thumb || item.id || item.externalId}
              className="review-card__picture-btn"
              onClick={() => onMediaClick(review.media, i)}
              aria-label={`View attachment ${i + 1}`}
            >
              {item.type === 'image' && (
                <img src={item.thumb} alt="" loading="lazy" />
              )}
              {item.type === 'youtube' && (
                <>
                  <img src={item.thumb} alt="" loading="lazy" />
                  <span className="review-card__play-icon">▶</span>
                </>
              )}
              {item.type === 'video' && (
                <>
                  <img
                    src={`https://customer-6q3jjmkvywtsdrs6.cloudflarestream.com/${item.externalId}/thumbnails/thumbnail.jpg?height=720`}
                    alt=""
                    loading="lazy"
                  />
                  <span className="review-card__play-icon">▶</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LightboxMedia({item}) {
  if (item.type === 'youtube') {
    return (
      <iframe
        className="review-lightbox__iframe"
        src={`https://www.youtube.com/embed/${item.id}?autoplay=1`}
        title="Review video"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }
  if (item.type === 'video') {
    return (
      <iframe
        className="review-lightbox__iframe"
        src={`https://iframe.videodelivery.net/${item.externalId}`}
        title="Review video"
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    );
  }
  return <img src={item.full} alt="" className="review-lightbox__img" />;
}

function Lightbox({images, index, onClose, onNext, onPrev}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="review-lightbox" role="dialog" aria-modal="true" aria-label="Review attachment">
      <button className="review-lightbox__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div className="review-lightbox__content">
        <LightboxMedia item={images[index]} />
        {images.length > 1 && (
          <div className="review-lightbox__nav-row">
            <button
              className="review-lightbox__nav review-lightbox__nav--prev"
              onClick={onPrev}
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              className="review-lightbox__nav review-lightbox__nav--next"
              onClick={onNext}
              aria-label="Next image"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
