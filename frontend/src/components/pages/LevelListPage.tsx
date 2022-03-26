import "./LevelListPage.css";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { defaultSearchQuery } from "src/components/LevelSearchSidebar";
import { LevelSearchSidebar } from "src/components/LevelSearchSidebar";
import { LevelsTable } from "src/components/LevelsTable";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { filterFalsyObjectValues } from "src/utils";
import { getCurrentSearchParams } from "src/utils";

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  tags: (qp.tags?.split(/,/g) || []).map((item) => +item),
  genres: (qp.genres?.split(/,/g) || []).map((item) => +item),
  engines: (qp.engines?.split(/,/g) || []).map((item) => +item),
  authors: [],
  isApproved: qp.approved === "1" ? true : qp.approved === "0" ? false : true,
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

const LevelListPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Level search");
  }, [setTitle]);

  return (
    <div className="LevelListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="LevelListPage--sidebar">
        <LevelSearchSidebar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>

      <div className="LevelListPage--results">
        <LevelsTable
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export { LevelListPage };
