import styles from "./index.module.css";
import { useState } from "react";
import { ExcludeUsers } from "src/components/common/ExcludeUsers";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { ReviewsList } from "src/components/common/ReviewsList";
import { AddOrEditReviewButton } from "src/components/pages/LevelPage/LevelReviewsTab/AddOrEditReviewButton";
import { DISABLE_PAGING } from "src/constants";
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
  const [reviewsSearchQuery, setReviewsSearchQuery] =
    useState<ReviewSearchQuery>(getReviewsSearchQuery(level.id));

  return (
    <>
      <div className={styles.actions}>
        <AddOrEditReviewButton level={level} />
      </div>

      <ReviewsList
        showLevels={false}
        searchQuery={reviewsSearchQuery}
        onSearchQueryChange={setReviewsSearchQuery}
        noItemsElement={
          <>
            There are no reviews for this level yet.
            <ExcludeUsers users={level.authors}>
              <PermissionGuard require={UserPermission.reviewLevels}>
                <br />
                <Link to={`/levels/${level.id}/review`}>
                  Be the first one to post!
                </Link>
              </PermissionGuard>
            </ExcludeUsers>
          </>
        }
      />
    </>
  );
};

export { LevelReviewsTab };
