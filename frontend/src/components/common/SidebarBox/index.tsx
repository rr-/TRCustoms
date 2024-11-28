import styles from "./index.module.css";

interface SidebarBoxProps {
  header?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const SidebarBox = ({ header, children }: SidebarBoxProps) => {
  return (
    <div className={styles.wrapper}>
      {header && <div className={styles.box}>{header}</div>}
      <div className={`${styles.box} ChildMarginClear`}>{children}</div>
    </div>
  );
};

export { SidebarBox };
