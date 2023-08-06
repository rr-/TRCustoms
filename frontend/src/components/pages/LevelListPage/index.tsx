import styles from "./index.module.css";
import { useState } from "react";
import { LevelList } from "src/components/common/LevelList";
import { LevelSearchSidebar } from "src/components/common/LevelSearchSidebar";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";
import { searchStringToBool } from "src/utils/misc";
import { boolToSearchString } from "src/utils/misc";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "-created",
  search: null,
  isApproved: true,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  tags: (qp.tags?.split(/,/g) || []).map((item) => +item),
  genres: (qp.genres?.split(/,/g) || []).map((item) => +item),
  engines: (qp.engines?.split(/,/g) || []).map((item) => +item),
  difficulties: (qp.difficulties?.split(/,/g) || []).map((item) => +item),
  durations: (qp.durations?.split(/,/g) || []).map((item) => +item),
  ratings: (qp.ratings?.split(/,/g) || []).map((item) => +item),
  authors: [],
  isApproved: searchStringToBool(qp.approved) ?? true,
  videoWalkthroughs: searchStringToBool(qp.video_walkthroughs),
  textWalkthroughs: searchStringToBool(qp.text_walkthroughs),
  date: qp.date,
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    tags: searchQuery.tags?.join(","),
    genres: searchQuery.genres?.join(","),
    engines: searchQuery.engines?.join(","),
    difficulties: searchQuery?.difficulties?.join(","),
    durations: searchQuery.durations?.join(","),
    ratings: searchQuery.ratings?.join(","),
    approved:
      searchQuery.isApproved === true
        ? null
        : boolToSearchString(searchQuery.isApproved),
    date: searchQuery.date,
    video_walkthroughs: boolToSearchString(searchQuery.videoWalkthroughs),
    text_walkthroughs: boolToSearchString(searchQuery.textWalkthroughs),
  });

const LevelListPage = () => {
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Level search",
      description:
        "Search our database for thousands of custom Tomb Raider games.",
    }),
    []
  );

  const sidebar = (
    <LevelSearchSidebar
      defaultSearchQuery={defaultSearchQuery}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    />
  );

  return (
    <div className={styles.wrapper}>
      <SidebarLayout sidebar={sidebar}>
        <QueryPersister
          serializeSearchQuery={serializeSearchQuery}
          deserializeSearchQuery={deserializeSearchQuery}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <LevelList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </SidebarLayout>
    </div>
  );
};

export { LevelListPage };
