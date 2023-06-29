import styles from "./index.module.css";

interface SidebarLayoutProps {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  stacked?: boolean;
}

const SidebarLayout = ({
  header,
  subheader,
  sidebar,
  children,
  stacked,
}: SidebarLayoutProps) => {
  const variant = stacked ? styles.stacked : styles.normal;

  return (
    <div className={`${styles.wrapper} ${variant}`}>
      {(header || subheader) && (
        <header className={`${styles.header} ChildMarginClear`}>
          {header && <h1 className={styles.headerText}>{header}</h1>}
          {subheader && <h2 className={styles.subheaderText}>{subheader}</h2>}
        </header>
      )}

      <aside className={styles.sidebar}>{sidebar}</aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { SidebarLayout };
