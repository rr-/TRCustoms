import styles from "./index.module.css";
import { PageHeader } from "src/components/common/PageHeader";

interface PlainLayoutProps {
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  children: React.ReactNode;
}

const PlainLayout = ({ header, subheader, children }: PlainLayoutProps) => {
  return (
    <div className={styles.wrapper}>
      <PageHeader header={header} subheader={subheader} />

      <div className="ChildMarginClear">{children}</div>
    </div>
  );
};

export { PlainLayout };
