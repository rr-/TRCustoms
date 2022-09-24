import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { GenreSearch } from "src/components/common/GenreSearch";
import { GenresTable } from "src/components/common/GenresTable";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
import type { GenreSearchQuery } from "src/services/GenreService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: GenreSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): GenreSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: GenreSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const GenreListPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<GenreSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Genres");
  }, [setTitle]);

  return (
    <div className="GenreListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <GenreSearch
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <div className="GenreListPage--results">
        <GenresTable
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export { GenreListPage };
