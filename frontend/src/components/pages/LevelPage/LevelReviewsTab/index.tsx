import styles from "./index.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { Dropdown } from "src/components/common/Dropdown";
import { ExcludeUsers } from "src/components/common/ExcludeUsers";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { ReviewsList } from "src/components/common/ReviewsList";
import { AddOrEditReviewButton } from "src/components/pages/LevelPage/LevelReviewsTab/AddOrEditReviewButton";
import { DISABLE_PAGING } from "src/constants";
import type { LevelDetails } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { StorageService } from "src/services/StorageService";
import { UserPermission } from "src/services/UserService";

interface LevelReviewsTabProps {
  level: LevelDetails;
}

const LEVEL_REVIEWS_SORT_STORAGE_KEY = "levelReviewsSort";

const reviewSortOptions = [
  {
    value: "-created",
    label: "Latest",
  },
  {
    value: "created",
    label: "Oldest",
  },
  {
    value: "-score,-created",
    label: "Popular",
  },
  {
    value: "score,-created",
    label: "Unpopular",
  },
];

const defaultReviewSort = reviewSortOptions[0].value;

const getSavedReviewSort = (): string => {
  const savedSort = StorageService.getItem(LEVEL_REVIEWS_SORT_STORAGE_KEY);
  return reviewSortOptions.some((option) => option.value === savedSort)
    ? savedSort
    : defaultReviewSort;
};

const getReviewsSearchQuery = (levelId: number): ReviewSearchQuery => ({
  levels: [levelId],
  page: DISABLE_PAGING,
  sort: getSavedReviewSort(),
  search: "",
});

const LevelReviewsTab = ({ level }: LevelReviewsTabProps) => {
  const [reviewsSearchQuery, setReviewsSearchQuery] =
    useState<ReviewSearchQuery>(getReviewsSearchQuery(level.id));

  useEffect(() => {
    StorageService.setItem(
      LEVEL_REVIEWS_SORT_STORAGE_KEY,
      reviewsSearchQuery.sort || defaultReviewSort,
    );
  }, [reviewsSearchQuery.sort]);

  return (
    <>
      <div className={styles.toolbar}>
        <AddOrEditReviewButton level={level} />
        <label className={styles.sortControl}>
          <span>Sort:</span>
          <Dropdown
            value={reviewsSearchQuery.sort || defaultReviewSort}
            onChange={(sort: string) =>
              setReviewsSearchQuery({
                ...reviewsSearchQuery,
                sort,
              })
            }
            options={reviewSortOptions}
          />
        </label>
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
