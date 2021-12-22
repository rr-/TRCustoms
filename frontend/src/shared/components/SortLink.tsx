import "./SortLink.css";
import { SortDescendingIcon } from "@heroicons/react/solid";
import { SortAscendingIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

enum SortLinkStatus {
  Inactive = 1,
  Active = 2,
  ActiveFlipped = 3,
}

interface SortLinkProps {
  sort: string;
  children: React.ReactNode;
}

const SortLink = ({ sort, children }: SortLinkProps) => {
  const [status, setStatus] = useState<SortLinkStatus>(SortLinkStatus.Inactive);
  const location = useLocation();
  useEffect(() => {
    const queryParams = Object.fromEntries(
      new URL(window.location.href).searchParams
    );
    if (queryParams.sort === sort) {
      setStatus(SortLinkStatus.Active);
    } else if (queryParams.sort === `-${sort}`) {
      setStatus(SortLinkStatus.ActiveFlipped);
    } else {
      setStatus(SortLinkStatus.Inactive);
    }
  }, [sort, location]);

  const descending = status === SortLinkStatus.Active;
  const isActive = status !== SortLinkStatus.Inactive;
  return (
    <Link
      to={`?sort=${descending ? "-" : ""}${sort}`}
      className={isActive ? "SortLink SortLink--active" : "SortLink"}
    >
      {children}
      <span className="SortLink--indicator">
        {descending ? (
          <SortDescendingIcon className="icon" />
        ) : (
          <SortAscendingIcon className="icon" />
        )}
      </span>
    </Link>
  );
};

export default SortLink;
