import { ReviewsListItem } from "./ReviewsListItem";
import { DataList } from "src/components/common/DataList";
import type { ReviewListing } from "src/services/ReviewService";
import { ReviewService } from "src/services/ReviewService";
import type { ReviewSearchQuery } from "src/services/ReviewService";

interface ReviewsListProps {
  showLevels: boolean;
  showExcerpts?: boolean | undefined;
  searchQuery: ReviewSearchQuery;
  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: ReviewSearchQuery) => void) | undefined;
  noItemsElement?: React.ReactNode;
}

const ReviewsList = ({
  showLevels,
  showExcerpts,
  searchQuery,
  onResultCountChange,
  onSearchQueryChange,
  noItemsElement,
}: ReviewsListProps) => {
  return (
    <DataList
      searchQuery={searchQuery}
      onResultCountChange={onResultCountChange}
      queryName="reviews"
      onSearchQueryChange={onSearchQueryChange}
      searchFunc={ReviewService.searchReviews}
      itemKey={(review: ReviewListing) => review.id.toString()}
      itemView={(review: ReviewListing) => (
        <ReviewsListItem
          review={review}
          showLevels={showLevels}
          showExcerpts={showExcerpts ?? false}
        />
      )}
      noItemsElement={noItemsElement}
    />
  );
};

export { ReviewsList };
