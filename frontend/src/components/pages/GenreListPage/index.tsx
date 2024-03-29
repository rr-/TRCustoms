import { useState } from "react";
import { GenreSearch } from "src/components/common/GenreSearch";
import { GenresTable } from "src/components/common/GenresTable";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
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
  const [searchQuery, setSearchQuery] = useState<GenreSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Genres",
      description: "Search for custom Tomb Raider games by genres.",
    }),
    []
  );

  return (
    <PlainLayout>
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

      <GenresTable
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </PlainLayout>
  );
};

export { GenreListPage };
