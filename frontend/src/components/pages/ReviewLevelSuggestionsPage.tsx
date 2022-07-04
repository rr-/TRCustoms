import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { LevelsTable } from "src/components/LevelsTable";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  isApproved: true,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  isApproved: true,
  reviewsMax: 5,
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    tags: searchQuery.tags.join(","),
    genres: searchQuery.genres.join(","),
    engines: searchQuery.engines.join(","),
    approved:
      searchQuery.isApproved === true
        ? null
        : searchQuery.isApproved === false
        ? "0"
        : null,
  });

const ReviewLevelSuggestionsPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Level search");
  }, [setTitle]);

  return (
    <div className="ReviewLevelSuggestionsPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="ReviewLevelSuggestionsPage--results">
        <LevelsTable
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export { ReviewLevelSuggestionsPage };
