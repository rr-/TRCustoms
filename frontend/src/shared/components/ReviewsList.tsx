import "./ReviewsList.css";
import { useQuery } from "react-query";
import type { ReviewListing } from "src/services/review.service";
import { ReviewService } from "src/services/review.service";
import type { ReviewSearchResult } from "src/services/review.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import { UserPermission } from "src/services/user.service";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";

interface ReviewsListProps {
  showLevels: boolean;
  searchQuery: ReviewSearchQuery;
  onSearchQueryChange?: (searchQuery: ReviewSearchQuery) => any | null;
}

interface ReviewViewProps {
  review: ReviewListing;
  showLevels: boolean;
}

const ReviewView = ({ review, showLevels }: ReviewViewProps) => {
  const classNames = ["ReviewsList--review"];

  const position = review.rating_class?.position || 0;
  if (position > 0) {
    classNames.push("positive");
  } else if (position < 0) {
    classNames.push("negative");
  } else {
    classNames.push("neutral");
  }

  return (
    <div className={classNames.join(" ")}>
      {showLevels ? (
        <div className="ReviewsList--level">
          <LevelLink level={review.level} />
        </div>
      ) : null}
      <Markdown children={review.text || "No review text is available."} />—{" "}
      <em>
        <UserLink user={review.author} />, {formatDate(review.created)}
      </em>
      <PermissionGuard
        require={UserPermission.editReviews}
        owningUsers={[review.author]}
      >
        <div>
          <PushButton
            to={`/levels/${review.level.id}/review/${review.id}/edit`}
          >
            Edit
          </PushButton>
        </div>
      </PermissionGuard>
    </div>
  );
};

const ReviewsList = ({
  showLevels,
  searchQuery,
  onSearchQueryChange,
}: ReviewsListProps) => {
  const result = useQuery<ReviewSearchResult, Error>(
    ["reviews", ReviewService.searchReviews, searchQuery],
    async () => ReviewService.searchReviews(searchQuery)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const reviews = result.data.results.filter((review) => !!review.text);

  return (
    <>
      <SectionHeader>Reviews</SectionHeader>
      {reviews.length ? (
        reviews.map((review) => (
          <ReviewView key={review.id} review={review} showLevels={showLevels} />
        ))
      ) : (
        <p>There are no result to show.</p>
      )}
    </>
  );
};

export { ReviewsList };
