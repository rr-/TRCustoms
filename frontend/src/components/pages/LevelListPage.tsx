import "./LevelListPage.css";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { LevelList } from "src/components/LevelList";
import { LevelSearchSidebar } from "src/components/LevelSearchSidebar";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
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
  isApproved: true,
};

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
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>

      <div className="LevelListPage--results">
        <LevelList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export { LevelListPage };
