import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { LevelsTable } from "src/components/LevelsTable";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

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
  const { setTitle } = useContext(TitleContext);

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

  useEffect(() => {
    setTitle("My levels");
  }, [setTitle]);

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
    <div className="MyLevelsPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <LevelsTable
        showStatus={true}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
};

export { MyLevelsPage };
