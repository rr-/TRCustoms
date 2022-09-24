import styles from "./index.module.css";

interface SidebarBoxProps {
  header?: React.ReactNode | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
}

const SidebarBox = ({ header, actions, children }: SidebarBoxProps) => {
  return (
    <div className={`${styles.box} ChildMarginClear`}>
      {header && <div>{header}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
      <div className="ChildMarginClear">{children}</div>
    </div>
  );
};

export { SidebarBox };
