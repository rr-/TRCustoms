import styles from "./index.module.css";

enum SidebarLayoutVariant {
  Stacked = "stacked",
  Regular = "regular",
  Reverse = "reverse",
}

interface SidebarLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  variant?: SidebarLayoutVariant;
}

const SidebarLayout = ({
  header,
  sidebar,
  children,
  variant,
}: SidebarLayoutProps) => {
  variant ||= SidebarLayoutVariant.Regular;

  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      {header && <div className={styles.header}>{header}</div>}

      <aside className={styles.sidebar}>{sidebar}</aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { SidebarLayout, SidebarLayoutVariant };
