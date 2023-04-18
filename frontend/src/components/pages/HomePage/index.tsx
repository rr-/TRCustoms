import styles from "./index.module.css";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { FeaturedLevelsView } from "src/components/pages/HomePage/FeaturedLevels";
import { StatsSidebar } from "src/components/pages/HomePage/StatsSidebar";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const HomePage = () => {
  usePageMetadata(() => ({ ready: true, title: "" }), []);

  return (
    <div className={styles.page}>
      <div className={styles.featuredLevels}>
        <FeaturedLevelsView />
      </div>
      <aside className={styles.leftSidebar}>
        <StatsSidebar />
      </aside>
      <aside className={styles.rightSidebar}>
        <NewsSidebar />
      </aside>
    </div>
  );
};

export { HomePage };
