import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { GenreSearch } from "src/components/GenreSearch";
import { defaultSearchQuery } from "src/components/GenreSearch";
import { GenresTable } from "src/components/GenresTable";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { TitleContext } from "src/contexts/TitleContext";
import type { GenreSearchQuery } from "src/services/GenreService";
import { getCurrentSearchParams } from "src/utils/misc";

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
