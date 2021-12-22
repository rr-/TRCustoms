import { useEffect } from "react";
import { useState } from "react";
import type { To } from "react-router";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

interface LinkWithQueryProps {
  children: React.ReactNode;
  to: To;
  props?: any;
}

const LinkWithQuery = ({ children, to, ...props }: LinkWithQueryProps) => {
  const [realTo, setRealTo] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const currentURL = new URL(window.location.href);
    if (to instanceof Object) {
      setRealTo({
        ...to,
        search:
          "?" +
          new URLSearchParams({
            ...Object.fromEntries(currentURL.searchParams),
            ...Object.fromEntries(new URLSearchParams(to.search)),
          }).toString(),
      });
    } else {
      currentURL.search =
        "?" +
        new URLSearchParams({
          ...Object.fromEntries(currentURL.searchParams),
          ...Object.fromEntries(new URLSearchParams(to)),
        }).toString();
      setRealTo(currentURL.pathname + currentURL.search);
    }
  }, [location, to]);

  return (
    <>
      {realTo ? (
        <Link to={realTo} {...props}>
          {children}
        </Link>
      ) : (
        <></>
      )}
    </>
  );
};

export { LinkWithQuery };
