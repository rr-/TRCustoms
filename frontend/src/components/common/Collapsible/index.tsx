import styles from "./index.module.css";
import { useState } from "react";
import { IconChevronDown } from "src/components/icons/IconChevronDown";
import { IconChevronUp } from "src/components/icons/IconChevronUp";
import { StorageService } from "src/services/StorageService";

interface CollapsibleProps {
  storageKey: string;
  isExpanded?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
}

const getCollapseStatus = (): { [storageKey: string]: boolean } => {
  try {
    return JSON.parse(StorageService.getItem("collapse") || "{}");
  } catch (error) {
    return {};
  }
};

const Collapsible = ({
  title,
  storageKey,
  children,
  ...props
}: CollapsibleProps) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const collapseStatus = getCollapseStatus();
    return collapseStatus[storageKey] !== false;
  });

  const handleLinkClick = () => {
    setIsExpanded((isExpanded) => {
      const nextIsExpanded = !isExpanded;
      const collapseStatus = getCollapseStatus();
      collapseStatus[storageKey] = nextIsExpanded;
      StorageService.setItem("collapse", JSON.stringify(collapseStatus));
      return nextIsExpanded;
    });
  };

  return (
    <div>
      <span className={styles.header} onClick={handleLinkClick} role="link">
        {title}
        {isExpanded ? <IconChevronDown /> : <IconChevronUp />}
      </span>
      {isExpanded && children}
    </div>
  );
};

export { Collapsible };
