import styles from "./index.module.css";
import { useState } from "react";
import { useContext } from "react";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { RatingsTable } from "src/components/common/RatingsTable";
import { IconThumbUp } from "src/components/icons";
import { DISABLE_PAGING } from "src/constants";
import { UserContext } from "src/contexts/UserContext";
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
  const { user } = useContext(UserContext);

  const [ratingsSearchQuery, setRatingsSearchQuery] = useState<
    RatingSearchQuery
  >(getRatingsSearchQuery(level.id));

  return (
    <>
      <div className={styles.actions}>
        {level.authors.every((author) => author.id !== user?.id) && (
          <PermissionGuard require={UserPermission.rateLevels}>
            <Button icon={<IconThumbUp />} to={`/levels/${level.id}/rating`}>
              Rate this level
            </Button>
          </PermissionGuard>
        )}
      </div>

      <RatingsTable
        searchQuery={ratingsSearchQuery}
        onSearchQueryChange={setRatingsSearchQuery}
        showLevels={false}
        showAuthors={true}
      />
    </>
  );
};

export { LevelRatingsTab };
