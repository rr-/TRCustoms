import "./SortLink.css";
import { IconSortDescending } from "src/components/icons";
import { IconSortAscending } from "src/components/icons";

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
  const handleButtonClick = () =>
    onSortChange((descending ? "-" : "") + targetSort);

  return (
    <button
      type="button"
      onClick={handleButtonClick}
      className={`link ${isActive ? "SortLink SortLink--active" : "SortLink"}`}
    >
      {children}
      <span className="SortLink--indicator">
        {descending ? <IconSortDescending /> : <IconSortAscending />}
      </span>
    </button>
  );
};

export { SortLink };
