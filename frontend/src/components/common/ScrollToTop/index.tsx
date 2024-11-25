import { useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useScrollStore } from "src/contexts/ScrollContext";

const ScrollToTop = () => {
  const location = useLocation();
  const { shouldScroll, setShouldScroll } = useScrollStore((state) => state);
  const shouldScrollThisTime = useRef(false);

  useEffect(() => {
    shouldScrollThisTime.current = shouldScroll;
  }, [shouldScroll, shouldScrollThisTime]);

  useEffect(() => {
    if (shouldScrollThisTime.current) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } else {
      setShouldScroll(true);
    }
  }, [location, setShouldScroll]);

  return null;
};

export { ScrollToTop };
