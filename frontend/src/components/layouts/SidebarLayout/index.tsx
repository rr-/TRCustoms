import styles from "./index.module.css";
import { PageHeader } from "src/components/common/PageHeader";

enum SidebarLayoutVariant {
  Stacked = "stacked",
  Regular = "regular",
  Reverse = "reverse",
}

interface SidebarLayoutProps {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  variant?: SidebarLayoutVariant;
}

const SidebarLayout = ({
  header,
  subheader,
  sidebar,
  children,
  variant,
}: SidebarLayoutProps) => {
  variant ||= SidebarLayoutVariant.Regular;

  return (
    <div className={`${styles.wrapper} ${styles[variant]}`}>
      {(header || subheader) && (
        <div className={styles.header}>
          <PageHeader header={header} subheader={subheader} />
        </div>
      )}

      <aside className={styles.sidebar}>{sidebar}</aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { SidebarLayout, SidebarLayoutVariant };
