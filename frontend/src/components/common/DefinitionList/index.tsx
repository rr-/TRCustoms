import styles from "./index.module.css";

interface DefinitionItemGroupProps {
  className?: string | undefined;
  children: React.ReactNode;
}

const DefinitionItemGroup = ({
  className,
  children,
}: DefinitionItemGroupProps) => {
  return (
    <div className={`${styles.group} ChildMarginClear ${className || ""}`}>
      {children}
    </div>
  );
};

interface DefinitionItemProps {
  span?: boolean | undefined;
  term?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const DefinitionItem = ({ span, term, children }: DefinitionItemProps) => {
  return (
    <div className={`${styles.item} ${span ? styles.span : ""}`}>
      {term && <div className={styles.term}>{term}</div>}
      <div className={styles.value}>{children}</div>
    </div>
  );
};

interface DefinitionListProps {
  children: React.ReactNode;
}

const DefinitionList = ({ children }: DefinitionListProps) => {
  return <div className={styles.list}>{children}</div>;
};

export { DefinitionItem, DefinitionItemGroup, DefinitionList };
