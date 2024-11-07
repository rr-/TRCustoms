import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { LevelSidebar } from "src/components/common/LevelSidebar";
import { Loader } from "src/components/common/Loader";
import { TabSwitch } from "src/components/common/TabSwitch";
import { TabSwitchVariant } from "src/components/common/TabSwitch";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { LevelHeader } from "src/components/pages/LevelPage/LevelHeader";
import { LevelOverviewTab } from "src/components/pages/LevelPage/LevelOverviewTab";
import { LevelReviewsTab } from "src/components/pages/LevelPage/LevelReviewsTab";
import { LevelWalkthroughsTab } from "src/components/pages/LevelPage/LevelWalkthroughsTab";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { LevelService } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";

interface LevelPageParams {
  levelId: string;
}

const LevelPage = () => {
  const { levelId } = (useParams() as unknown) as LevelPageParams;

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.name,
      image: result.data?.cover?.url,
      description: result.data?.authors
        ? `A custom Tomb Raider level by ${result.data?.authors.map(
            (author) => author.username
          )}`
        : `A custom Tomb Raider level.`,
    }),
    [result]
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;

  const tabs = [
    {
      label: "Overview",
      content: <LevelOverviewTab level={level} />,
    },

    {
      label: "Reviews",
      content: <LevelReviewsTab level={level} />,
    },

    {
      label: "Walkthroughs",
      content: <LevelWalkthroughsTab level={level} />,
    },
  ];

  return (
    <SidebarLayout
      header={<LevelHeader level={level} />}
      sidebar={<LevelSidebar level={level} />}
    >
      <TabSwitch variant={TabSwitchVariant.Light} tabs={tabs} />
    </SidebarLayout>
  );
};

export { LevelPage };
