import { useState } from "react";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { TagSearch } from "src/components/common/TagSearch";
import { TagsTable } from "src/components/common/TagsTable";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { TagSearchQuery } from "src/services/TagService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: TagSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): TagSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: TagSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const TagListPage = () => {
  const [searchQuery, setSearchQuery] = useState<TagSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Tags",
      description: "Search for custom Tomb Raider games by tags.",
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

      <TagSearch
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <TagsTable
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </PlainLayout>
  );
};

export { TagListPage };
