import styles from "./index.module.css";
import { useContext } from "react";
import { useEffect } from "react";
import { NewsSidebar } from "src/components/common/NewsSidebar";
import { FeaturedLevelsView } from "src/components/pages/HomePage/FeaturedLevels";
import { StatsSidebar } from "src/components/pages/HomePage/StatsSidebar";
import { TitleContext } from "src/contexts/TitleContext";

const HomePage = () => {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("");
  }, [setTitle]);

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
