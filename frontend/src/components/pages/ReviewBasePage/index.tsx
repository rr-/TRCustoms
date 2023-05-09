import styles from "./index.module.css";
import { ReviewSearchSidebar } from "src/components/common/ReviewSearchSidebar";

interface ReviewBasePageProps {
  children: React.ReactNode;
}

const ReviewBasePage = ({ children }: ReviewBasePageProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <ReviewSearchSidebar />
      </div>
      <div className={styles.main}>{children}</div>
    </div>
  );
};

export { ReviewBasePage };
