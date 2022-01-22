import { useState } from "react";
import { useContext } from "react";
import type { LevelSearchQuery } from "src/services/level.service";
import { LevelsTable } from "src/shared/components/LevelsTable";
import { QueryPersister } from "src/shared/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { UserContext } from "src/shared/contexts/UserContext";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getCurrentSearchParams } from "src/shared/utils";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "-created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  isApproved: null,
};

const MyLevelsPage = () => {
  const { user } = useContext(UserContext);

  const deserializeSearchQuery = (qp: {
    [key: string]: string;
  }): LevelSearchQuery => ({
    ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
    tags: (qp.tags?.split(/,/g) || []).map((item) => +item),
    genres: (qp.genres?.split(/,/g) || []).map((item) => +item),
    engines: (qp.engines?.split(/,/g) || []).map((item) => +item),
    authors: user ? [user.id] : [],
    isApproved: null,
  });
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  const serializeSearchQuery = (
    searchQuery: LevelSearchQuery
  ): { [key: string]: any } =>
    filterFalsyObjectValues({
      ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
      tags: searchQuery.tags.join(","),
      genres: searchQuery.genres.join(","),
      engines: searchQuery.engines.join(","),
    });

  return (
    <div id="MyLevelsPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div id="MyLevelsPage--results">
        <LevelsTable
          showStatus={true}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export { MyLevelsPage };
