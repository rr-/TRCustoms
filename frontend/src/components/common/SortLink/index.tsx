import styles from "./index.module.css";
import { Link } from "src/components/common/Link";
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
    <Link
      onClick={handleButtonClick}
      className={`${styles.link} ${isActive ? styles.active : ""}`}
    >
      {children}
      <span className={styles.indicator}>
        {descending ? <IconSortDescending /> : <IconSortAscending />}
      </span>
    </Link>
  );
};

export { SortLink };
