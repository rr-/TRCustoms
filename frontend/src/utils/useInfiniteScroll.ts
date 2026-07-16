import { useRef } from "react";
import { useEffect } from "react";

interface UseInfiniteScrollProps {
  element: React.RefObject<Element | null>;
  fetch: () => void;
}

const useInfiniteScroll = (
  { element, fetch }: UseInfiniteScrollProps,
  dependencies?: React.DependencyList | undefined,
) => {
  const loader = useRef(fetch);

  // Lazily create a single observer: passing the constructor to useRef would
  // re-run it on every render (useRef keeps the first value but still evaluates
  // its argument), allocating and discarding an observer each time.
  const observer = useRef<IntersectionObserver | null>(null);
  if (!observer.current) {
    observer.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loader.current();
        }
      },
      { threshold: 0.5 },
    );
  }

  useEffect(() => {
    loader.current = fetch;
  }, [fetch]);

  // Disconnect the observer when the hook unmounts.
  useEffect(() => {
    const currentObserver = observer.current;
    return () => currentObserver?.disconnect();
  }, []);

  useEffect(
    () => {
      const currentElement = element?.current;
      const currentObserver = observer.current;

      if (currentElement && currentObserver) {
        currentObserver.observe(currentElement);
      }
      return () => {
        if (currentElement && currentObserver) {
          currentObserver.unobserve(currentElement);
        }
      };
    },
    // eslint-disable-next-line
    [element, ...(dependencies || [])],
  );
};

export { useInfiniteScroll };
