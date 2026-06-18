import {useState, useEffect, useRef} from 'react';
import {useFetcher} from '@remix-run/react';

const PER_PAGE = 5;

export function ReviewGallery({productId}) {
  const fetcher = useFetcher();
  const [page, setPage] = useState(1);
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

  if (!loading && reviews.length === 0 && fetcher.data) return null;

  return (
    <div className="review-gallery" ref={galleryRef}>
      {/* <h2 className="review-gallery__title">Reviews</h2> */}
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
              <ReviewCard key={review.id} review={review} />
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

function ReviewCard({review}) {
  const date = new Date(review.created_at.replace(' ', 'T').replace(' UTC', 'Z')).toLocaleDateString('en-US', {
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
    </div>
  );
}
