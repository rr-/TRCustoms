import styles from "./index.module.css";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { Loader } from "src/components/common/Loader";
import { LightTabSwitch } from "src/components/common/TabSwitch";
import type { TabPage } from "src/components/common/TabSwitch";
import { ResponseErrorPage } from "src/components/pages/ErrorPage";
import { LevelHeader } from "src/components/pages/LevelPage/LevelHeader";
import { LevelOverviewTab } from "src/components/pages/LevelPage/LevelOverviewTab";
import { LevelRatingsTab } from "src/components/pages/LevelPage/LevelRatingsTab";
import { LevelReviewsTab } from "src/components/pages/LevelPage/LevelReviewsTab";
import { LevelSidebar } from "src/components/pages/LevelPage/LevelSidebar";
import { LevelWalkthroughsTab } from "src/components/pages/LevelPage/LevelWalkthroughsTab";
import { RatingAddAction } from "src/components/pages/LevelPage/RatingAddAction";
import { RatingEditAction } from "src/components/pages/LevelPage/RatingEditAction";
import { ReviewAddAction } from "src/components/pages/LevelPage/ReviewAddAction";
import { ReviewEditAction } from "src/components/pages/LevelPage/ReviewEditAction";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { useScrollStore } from "src/contexts/ScrollContext";
import { LevelService } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";

interface LevelPageParams {
  levelId: string;
}

interface LevelPageProps {
  action?: string;
  tabName?: string;
}

const LevelPage = ({ tabName, action }: LevelPageProps) => {
  const navigate = useNavigate();
  const { levelId } = useParams() as unknown as LevelPageParams;
  const { setShouldScroll } = useScrollStore((state) => state);

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId),
  );

  const handleTabChange = (tab: TabPage) => {
    setShouldScroll(false);
    if (tab.name === "overview") {
      navigate(`/levels/${level.id}`);
    } else {
      navigate(`/levels/${level.id}/${tab.name}`);
    }
  };

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.name,
      image: result.data?.cover?.url,
      description: result.data?.authors
        ? `A custom Tomb Raider level by ${result.data?.authors.map(
            (author) => author.username,
          )}`
        : `A custom Tomb Raider level.`,
    }),
    [result],
  );

  if (result.error) {
    return <ResponseErrorPage error={result.error} />;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;

  const tabs = [
    {
      name: "overview",
      label: "Overview",
      content: <LevelOverviewTab level={level} />,
    },

    {
      name: "ratings",
      label: `Ratings (${level.rating_count})`,
      content:
        action === "addRating" ? (
          <RatingAddAction level={level} />
        ) : action === "editRating" ? (
          <RatingEditAction level={level} />
        ) : (
          <LevelRatingsTab level={level} />
        ),
    },

    {
      name: "reviews",
      label: `Reviews (${level.review_count})`,
      content:
        action === "addReview" ? (
          <ReviewAddAction level={level} />
        ) : action === "editReview" ? (
          <ReviewEditAction level={level} />
        ) : (
          <LevelReviewsTab level={level} />
        ),
    },

    {
      name: "walkthroughs",
      label: `Walkthroughs (${level.walkthrough_count})`,
      content: <LevelWalkthroughsTab level={level} />,
    },
  ];

  tabName ??= "overview";

  const status = level.is_approved ? null : (
    <InfoMessage type={InfoMessageType.Warning}>
      {level.rejection_reason ? (
        <>This level was rejected by staff. Reason: {level.rejection_reason}</>
      ) : (
        <>This level is currently pending approval.</>
      )}
    </InfoMessage>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <LevelHeader level={level} />
      </div>
      <div className={styles.sidebar}>
        <LevelSidebar level={level} />
      </div>

      <div className={styles.content}>
        {status}
        <LightTabSwitch
          tabs={tabs}
          tabName={tabName}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
};

export { LevelPage };
