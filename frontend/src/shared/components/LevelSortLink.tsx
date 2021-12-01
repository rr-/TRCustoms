import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const LevelSortLink = ({ sort, children }: { sort: string; children: any }) => {
  const [realSort, setRealSort] = useState<string>(sort);
  const location = useLocation();
  useEffect(() => {
    const queryParams = Object.fromEntries(
      new URL(window.location.href).searchParams
    );
    setRealSort(queryParams.sort === sort ? `-${sort}` : sort);
  }, [sort, location]);

  return <Link to={`?sort=${realSort}`}>{children}</Link>;
};

export default LevelSortLink;
