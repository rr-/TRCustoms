import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const LinkWithQuery = ({ children, to, ...props }: any) => {
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
