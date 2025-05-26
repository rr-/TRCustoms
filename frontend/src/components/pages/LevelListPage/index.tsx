import styles from "./index.module.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GenreSearchSidebar } from "src/components/common/GenreSearchSidebar";
import { GenresTable } from "src/components/common/GenresTable";
import { LevelList } from "src/components/common/LevelList";
import { LevelSearchSidebar } from "src/components/common/LevelSearchSidebar";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { LightTabSwitch } from "src/components/common/TabSwitch";
import type { TabPage } from "src/components/common/TabSwitch";
import { TagSearchSidebar } from "src/components/common/TagSearchSidebar";
import { TagsTable } from "src/components/common/TagsTable";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { GenreSearchQuery } from "src/services/GenreService";
import type { LevelSearchQuery } from "src/services/LevelService";
import type { TagSearchQuery } from "src/services/TagService";
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

const defaultGenreSearchQuery: GenreSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const deserializeGenreSearchQuery = (qp: {
  [key: string]: string;
}): GenreSearchQuery =>
  deserializeGenericSearchQuery(qp, defaultGenreSearchQuery);

const serializeGenreSearchQuery = (
  searchQuery: GenreSearchQuery,
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultGenreSearchQuery);

const defaultTagSearchQuery: TagSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const deserializeTagSearchQuery = (qp: {
  [key: string]: string;
}): TagSearchQuery => deserializeGenericSearchQuery(qp, defaultTagSearchQuery);

const serializeTagSearchQuery = (
  searchQuery: TagSearchQuery,
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultTagSearchQuery);

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
  isApproved: searchStringToBool(qp.approved),
  videoWalkthroughs: searchStringToBool(qp.video_walkthroughs),
  textWalkthroughs: searchStringToBool(qp.text_walkthroughs),
  date: qp.date,
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery,
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    tags: searchQuery.tags?.join(","),
    genres: searchQuery.genres?.join(","),
    engines: searchQuery.engines?.join(","),
    difficulties: searchQuery?.difficulties?.join(","),
    durations: searchQuery.durations?.join(","),
    ratings: searchQuery.ratings?.join(","),
    approved: boolToSearchString(searchQuery.isApproved),
    date: searchQuery.date,
    video_walkthroughs: boolToSearchString(searchQuery.videoWalkthroughs),
    text_walkthroughs: boolToSearchString(searchQuery.textWalkthroughs),
  });

interface LevelListPageProps {
  initialTabName?: string;
}

const LevelListPage = ({ initialTabName }: LevelListPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabName = (() => {
    if (location.pathname.startsWith("/tags")) return "tags";
    if (location.pathname.startsWith("/genres")) return "genres";
    return "levels";
  })();

  const handleTabChange = (tab: TabPage) => {
    navigate(`/${tab.name}`);
  };

  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams()),
  );
  const [genreSearchQuery, setGenreSearchQuery] = useState<GenreSearchQuery>(
    deserializeGenreSearchQuery(getCurrentSearchParams()),
  );
  const [tagSearchQuery, setTagSearchQuery] = useState<TagSearchQuery>(
    deserializeTagSearchQuery(getCurrentSearchParams()),
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Level search",
      description:
        "Search our database for thousands of custom Tomb Raider games.",
    }),
    [],
  );

  const tabs: TabPage[] = [
    {
      name: "levels",
      label: "Levels",
      content: (
        <>
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
        </>
      ),
    },

    {
      name: "genres",
      label: "Genres",
      content: (
        <>
          <QueryPersister
            serializeSearchQuery={serializeGenreSearchQuery}
            deserializeSearchQuery={deserializeGenreSearchQuery}
            searchQuery={genreSearchQuery}
            setSearchQuery={setGenreSearchQuery}
          />
          <GenresTable
            searchQuery={genreSearchQuery}
            onSearchQueryChange={setGenreSearchQuery}
          />
        </>
      ),
    },

    {
      name: "tags",
      label: "Tags",
      content: (
        <>
          <QueryPersister
            serializeSearchQuery={serializeTagSearchQuery}
            deserializeSearchQuery={deserializeTagSearchQuery}
            searchQuery={tagSearchQuery}
            setSearchQuery={setTagSearchQuery}
          />
          <TagsTable
            searchQuery={tagSearchQuery}
            onSearchQueryChange={setTagSearchQuery}
          />
        </>
      ),
    },
  ];

  let sidebar;
  if (tabName === "levels") {
    sidebar = (
      <LevelSearchSidebar
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    );
  } else if (tabName === "genres") {
    sidebar = (
      <GenreSearchSidebar
        defaultSearchQuery={defaultGenreSearchQuery}
        searchQuery={genreSearchQuery}
        onSearchQueryChange={setGenreSearchQuery}
      />
    );
  } else {
    sidebar = (
      <TagSearchSidebar
        defaultSearchQuery={defaultTagSearchQuery}
        searchQuery={tagSearchQuery}
        onSearchQueryChange={setTagSearchQuery}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <SidebarLayout sidebar={sidebar}>
        <LightTabSwitch
          tabs={tabs}
          tabName={tabName}
          onTabChange={handleTabChange}
        />
      </SidebarLayout>
    </div>
  );
};

export { LevelListPage };
