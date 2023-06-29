import styles from "./index.module.css";
import { PageHeader } from "src/components/common/PageHeader";

interface CenterLayoutProps {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  children: React.ReactNode;
}

const CenterLayout = ({ header, subheader, children }: CenterLayoutProps) => {
  return (
    <div className={styles.wrapper}>
      <PageHeader header={header} subheader={subheader} />

      {children}
    </div>
  );
};

export { CenterLayout };
