import "./SortLink.css";
import { SortDescendingIcon } from "@heroicons/react/solid";
import { SortAscendingIcon } from "@heroicons/react/solid";

enum SortLinkStatus {
  Inactive = 1,
  Active = 2,
  ActiveFlipped = 3,
}

interface SortLinkProps {
  currentSort: string | null;
  targetSort: string;
  onSortChange: (sort: string) => void;
  children: React.ReactNode;
}

const SortLink = ({
  currentSort,
  targetSort,
  onSortChange,
  children,
}: SortLinkProps) => {
  let status: SortLinkStatus;
  if (currentSort === targetSort) {
    status = SortLinkStatus.Active;
  } else if (currentSort === `-${targetSort}`) {
    status = SortLinkStatus.ActiveFlipped;
  } else {
    status = SortLinkStatus.Inactive;
  }

  const descending = status === SortLinkStatus.Active;
  const isActive = status !== SortLinkStatus.Inactive;
  const buttonClick = () => onSortChange((descending ? "-" : "") + targetSort);

  return (
    <button
      type="button"
      onClick={buttonClick}
      className={`link ${isActive ? "SortLink SortLink--active" : "SortLink"}`}
    >
      {children}
      <span className="SortLink--indicator">
        {descending ? (
          <SortDescendingIcon className="icon" />
        ) : (
          <SortAscendingIcon className="icon" />
        )}
      </span>
    </button>
  );
};

export { SortLink };
