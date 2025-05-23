import { useState } from "react";
import { useEffect } from "react";
import { ReviewsList } from "src/components/common/ReviewsList";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import type { UserDetails } from "src/services/UserService";

const getReviewSearchQuery = (userId: number): ReviewSearchQuery => ({
  authors: [userId],
  page: null,
  sort: "-created",
  search: "",
});

interface ReviewsTabProps {
  user: UserDetails;
  isLoggedIn: boolean;
}

const ReviewsTab = ({ user, isLoggedIn }: ReviewsTabProps) => {
  const [reviewSearchQuery, setReviewSearchQuery] = useState<ReviewSearchQuery>(
    getReviewSearchQuery(user.id),
  );

  useEffect(() => {
    setReviewSearchQuery(getReviewSearchQuery(user.id));
  }, [user.id, isLoggedIn]);

  return (
    <ReviewsList
      showLevels={true}
      searchQuery={reviewSearchQuery}
      onSearchQueryChange={setReviewSearchQuery}
    />
  );
};

export { ReviewsTab };
