import { NewsSidebar } from "src/components/common/NewsSidebar";
import { HomeLayout } from "src/components/layouts/HomeLayout";
import { FeaturedLevelsView } from "src/components/pages/HomePage/FeaturedLevels";
import { StatsSidebar } from "src/components/pages/HomePage/StatsSidebar";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const HomePage = () => {
  usePageMetadata(() => ({ ready: true, title: "" }), []);

  return (
    <HomeLayout left={<StatsSidebar />} right={<NewsSidebar />}>
      <FeaturedLevelsView />
    </HomeLayout>
  );
};

export { HomePage };
