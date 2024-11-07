import { useState } from "react";
import { ReviewsList } from "src/components/common/ReviewsList";
import { DISABLE_PAGING } from "src/constants";
import type { LevelDetails } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";

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
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >(getReviewsSearchQuery(level.id));

  return (
    <ReviewsList
      showLevels={false}
      searchQuery={reviewsSearchQuery}
      onSearchQueryChange={setReviewsSearchQuery}
    />
  );
};

export { LevelReviewsTab };
