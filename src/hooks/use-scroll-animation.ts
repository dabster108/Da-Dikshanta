import { useEffect, useRef, useState, useLayoutEffect } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin]);

  return { elementRef, isVisible };
};

export const useStaggeredScrollAnimation = (
  itemCount: number, 
  options: ScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const hasTriggered = useRef(false);

  useLayoutEffect(() => { // Using useLayoutEffect to prevent initial flicker
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          // Trigger a single state change to make all items visible
          // The staggering is now handled by CSS transition-delay
          setVisibleItems(new Array(itemCount).fill(true));
        } else if (!entry.isIntersecting) {
          hasTriggered.current = false;
          // Set all items to hidden when out of view
          setVisibleItems(new Array(itemCount).fill(false));
        }
      },
      { threshold, rootMargin }
    );

    const currentElement = containerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [itemCount, threshold, rootMargin]);

  return { containerRef, visibleItems };
};