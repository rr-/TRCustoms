import { useRef } from "react";
import { useEffect } from "react";

interface UseInfiniteScrollProps {
  element: any;
  fetch: () => void;
}

const useInfiniteScroll = (
  { element, fetch }: UseInfiniteScrollProps,
  dependencies?: any[] | undefined,
) => {
  const loader = useRef(fetch);

  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loader.current();
        }
      },
      { threshold: 0.5 },
    ),
  );

  useEffect(() => {
    loader.current = fetch;
  }, [fetch]);

  useEffect(
    () => {
      const currentElement = element?.current;
      const currentObserver = observer.current;

      if (currentElement) {
        currentObserver.observe(currentElement);
      }
      return () => {
        if (currentElement) {
          currentObserver.unobserve(currentElement);
        }
      };
    },
    // eslint-disable-next-line
    [element, ...(dependencies || [])],
  );
};

export { useInfiniteScroll };
