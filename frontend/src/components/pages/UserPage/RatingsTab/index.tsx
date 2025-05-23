import { useState } from "react";
import { useEffect } from "react";
import { RatingsTable } from "src/components/common/RatingsTable";
import type { RatingSearchQuery } from "src/services/RatingService";
import type { UserDetails } from "src/services/UserService";

const getRatingSearchQuery = (userId: number): RatingSearchQuery => ({
  authors: [userId],
  page: null,
  sort: "-created",
  search: "",
});

interface RatingsTabProps {
  user: UserDetails;
  isLoggedIn: boolean;
}

const RatingsTab = ({ user, isLoggedIn }: RatingsTabProps) => {
  const [ratingSearchQuery, setRatingSearchQuery] = useState<RatingSearchQuery>(
    getRatingSearchQuery(user.id),
  );

  useEffect(() => {
    setRatingSearchQuery(getRatingSearchQuery(user.id));
  }, [user.id, isLoggedIn]);

  return (
    <RatingsTable
      showAuthors={false}
      showLevels={true}
      searchQuery={ratingSearchQuery}
      onSearchQueryChange={setRatingSearchQuery}
    />
  );
};

export { RatingsTab };
