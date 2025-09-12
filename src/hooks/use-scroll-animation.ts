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

// Direction-aware per-item fade in/out
export const usePerItemFadeOnScroll = (
  itemCount: number,
  options: ScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const elementToIndex = useRef(new Map<Element, number>());
  const elements = useRef<(HTMLElement | null)[]>(new Array(itemCount).fill(null));
  const lastScrollY = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);
  const scrollDirectionRef = useRef<'down' | 'up'>('down');

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollDirectionRef.current = currentY > lastScrollY.current ? 'down' : 'up';
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const dir = scrollDirectionRef.current;
        setVisibleItems((prev) => {
          const next = [...prev];
          for (const entry of entries) {
            const idx = elementToIndex.current.get(entry.target);
            if (idx === undefined) continue;
            if (entry.isIntersecting && dir === 'down') {
              next[idx] = true; // fade in on scroll down
            }
            if (!entry.isIntersecting && dir === 'up') {
              next[idx] = false; // fade out on scroll up when leaving
            }
          }
          return next;
        });
      },
      { threshold, rootMargin }
    );

    // Observe current elements
    elements.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, itemCount]);

  useEffect(() => {
    // Keep arrays in sync if itemCount changes
    elements.current = new Array(itemCount).fill(null);
    setVisibleItems(new Array(itemCount).fill(false));
    elementToIndex.current.clear();
  }, [itemCount]);

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    const prevEl = elements.current[index];
    if (prevEl) {
      elementToIndex.current.delete(prevEl);
    }
    elements.current[index] = el;
    if (el) {
      elementToIndex.current.set(el, index);
    }
  };

  return { setItemRef, visibleItems };
};