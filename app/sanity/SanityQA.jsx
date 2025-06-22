import React, {useState, useRef, useEffect} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {PortableText} from '@portabletext/react';

function useIsFirstRender() {
  const isFirst = useRef(true);
  useEffect(() => {
    isFirst.current = false;
  }, []);
  return isFirst.current;
}
function SanityQA({value, children}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('right');
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const minSwipeDistance = 50;

  const handlePrevious = () => {
    if (index > 0) {
      setDirection('left');
      setIndex(index - 1);
    }
  };

  const handleNext = () => {
    if (index < value.questionsForYou.length - 1) {
      setDirection('right');
      setIndex(index + 1);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;

    const deltaX = touchStartX.current - touchCurrentX;
    const deltaY = touchStartY.current - touchCurrentY;

    // Only set direction if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (deltaX > 0) {
        // Swiping left - next item will come from right
        setDirection('right');
      } else {
        // Swiping right - next item will come from left
        setDirection('left');
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    // Only trigger swipe if horizontal movement is greater than vertical (to avoid interfering with scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swiped left - go to next
          if (index < value.questionsForYou.length - 1) {
            setIndex(index + 1);
          }
        } else {
          // Swiped right - go to previous
          if (index > 0) {
            setIndex(index - 1);
          }
        }
      }
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  const isFirstRender = useIsFirstRender();
  const initialX = isFirstRender ? 0 : direction === 'right' ? 100 : -100;

  return (
    <div
      className="article-q-a-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={handlePrevious}
        onMouseEnter={() => setDirection('left')}
        disabled={index === 0}
      >
        ←
      </button>
      <div>
        <p className="intro-heading">{value.owner}</p>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`q4u-${index}`}
            initial={{
              opacity: isFirstRender ? 1 : 0,
              x: initialX,
            }}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: direction === 'right' ? -100 : 100}}
            transition={{ease: 'easeInOut', duration: 0.15}}
          >
            <p>{value.questionsForYou[index].question}</p>
            <PortableText value={value.questionsForYou[index].answer} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div>
        <p className="intro-heading">{value.dog}</p>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`q4dog-${index}`}
            initial={{
              opacity: isFirstRender ? 1 : 0,
              x: initialX,
            }}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: direction === 'right' ? -100 : 100}}
            transition={{ease: 'easeInOut', duration: 0.15}}
          >
            <p>{value.questionsForYourDog[index].question}</p>
            <PortableText value={value.questionsForYourDog[index].answer} />
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        onClick={handleNext}
        onMouseEnter={() => setDirection('right')}
        disabled={index === value.questionsForYou.length - 1}
      >
        →
      </button>
    </div>
  );
}

export default SanityQA;
