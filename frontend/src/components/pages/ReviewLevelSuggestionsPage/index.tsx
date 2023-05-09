import { useState } from "react";
import { LevelList } from "src/components/common/LevelList";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { ReviewBasePage } from "src/components/pages/ReviewBasePage";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  difficulties: [],
  durations: [],
  ratings: [],
  isApproved: true,
  reviewsMax: 5,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...defaultSearchQuery,
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const ReviewLevelSuggestionsPage = () => {
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(() => ({ ready: true, title: "Level search" }), []);

  return (
    <ReviewBasePage>
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="ReviewLevelSuggestionsPage--results">
        <LevelList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </ReviewBasePage>
  );
};

export { ReviewLevelSuggestionsPage };
