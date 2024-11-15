import styles from "./index.module.css";
import { useState } from "react";
import { useContext } from "react";
import { Button } from "src/components/common/Button";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { ReviewsList } from "src/components/common/ReviewsList";
import { IconAnnotation } from "src/components/icons";
import { DISABLE_PAGING } from "src/constants";
import { UserContext } from "src/contexts/UserContext";
import type { LevelDetails } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";

interface LevelReviewsTabProps {
  level: LevelDetails;
}

const getReviewsSearchQuery = (levelId: number): ReviewSearchQuery => ({
  levels: [levelId],
  page: DISABLE_PAGING,
  sort: "-created",
  search: "",
});

const LevelReviewsTab = ({ level }: LevelReviewsTabProps) => {
  const { user } = useContext(UserContext);

  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >(getReviewsSearchQuery(level.id));

  return (
    <>
      <div className={styles.actions}>
        {level.authors.every((author) => author.id !== user?.id) && (
          <PermissionGuard require={UserPermission.reviewLevels}>
            <Button icon={<IconAnnotation />} to={`/levels/${level.id}/review`}>
              Write a review
            </Button>
          </PermissionGuard>
        )}
      </div>

      <ReviewsList
        showLevels={false}
        searchQuery={reviewsSearchQuery}
        onSearchQueryChange={setReviewsSearchQuery}
      />
    </>
  );
};

export { LevelReviewsTab };
