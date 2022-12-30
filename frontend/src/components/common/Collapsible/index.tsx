import styles from "./index.module.css";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { IconChevronDown } from "src/components/icons/IconChevronDown";
import { IconChevronUp } from "src/components/icons/IconChevronUp";
import { StorageService } from "src/services/StorageService";

interface CollapsibleProps {
  storageKey: string;
  isExpanded?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Collapsible = ({
  title,
  storageKey,
  children,
  ...props
}: CollapsibleProps) => {
  const collapseStatus: { [storageKey: string]: boolean } = JSON.parse(
    StorageService.getItem("collapse") || "{}"
  );
  const [isExpanded, setIsExpanded] = useState(
    collapseStatus[storageKey] !== false
  );

  const handleLinkClick = () => {
    collapseStatus[storageKey] = !isExpanded;
    setIsExpanded((isExpanded) => !isExpanded);
    StorageService.setItem("collapse", JSON.stringify(collapseStatus));
  };

  return (
    <div>
      <div className={styles.header}>
        {title}
        <Link onClick={handleLinkClick}>
          {isExpanded ? <IconChevronDown /> : <IconChevronUp />}
        </Link>
      </div>
      {isExpanded && children}
    </div>
  );
};

export { Collapsible };
