import { RatingsListItem } from "./RatingsListItem";
import { DataList } from "src/components/common/DataList";
import type { RatingListing } from "src/services/RatingService";
import { RatingService } from "src/services/RatingService";
import type { RatingSearchQuery } from "src/services/RatingService";

interface RatingsListProps {
  searchQuery: RatingSearchQuery;
  onResultCountChange?: ((count: number) => void) | undefined;
  onSearchQueryChange?: ((searchQuery: RatingSearchQuery) => void) | undefined;
}

const RatingsList = ({
  searchQuery,
  onResultCountChange,
  onSearchQueryChange,
}: RatingsListProps) => {
  return (
    <DataList
      searchQuery={searchQuery}
      onResultCountChange={onResultCountChange}
      queryName="ratings"
      onSearchQueryChange={onSearchQueryChange}
      searchFunc={RatingService.searchRatings}
      itemKey={(rating: RatingListing) => rating.id.toString()}
      itemView={(rating: RatingListing) => <RatingsListItem rating={rating} />}
    />
  );
};

export { RatingsList };
