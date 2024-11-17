import styles from "./index.module.css";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { RatingsTable } from "src/components/common/RatingsTable";
import { AddOrEditRatingButton } from "src/components/pages/LevelPage/LevelRatingsTab/AddOrEditRatingButton";
import { SpiderGraphWrapper } from "src/components/pages/LevelPage/LevelRatingsTab/SpiderGraph";
import { DISABLE_PAGING } from "src/constants";
import type { LevelDetails } from "src/services/LevelService";
import type { RatingSearchQuery } from "src/services/RatingService";
import { UserPermission } from "src/services/UserService";

interface LevelRatingsTabProps {
  level: LevelDetails;
}

const getRatingsSearchQuery = (levelId: number): RatingSearchQuery => ({
  levels: [levelId],
  page: DISABLE_PAGING,
  sort: "-created",
  search: "",
});

const LevelRatingsTab = ({ level }: LevelRatingsTabProps) => {
  const [ratingsSearchQuery, setRatingsSearchQuery] = useState<
    RatingSearchQuery
  >(getRatingsSearchQuery(level.id));

  return (
    <>
      <SpiderGraphWrapper levelId={level.id} />

      <div className={styles.actions}>
        <AddOrEditRatingButton level={level} />
      </div>

      <RatingsTable
        searchQuery={ratingsSearchQuery}
        onSearchQueryChange={setRatingsSearchQuery}
        showLevels={false}
        showAuthors={true}
        noItemsElement={
          <>
            There are no ratings for this level yet.
            <PermissionGuard require={UserPermission.rateLevels}>
              <br />
              <Link to={`/levels/${level.id}/rating`}>
                Be the first one to rate!
              </Link>
            </PermissionGuard>
          </>
        }
      />
    </>
  );
};

export { LevelRatingsTab };
