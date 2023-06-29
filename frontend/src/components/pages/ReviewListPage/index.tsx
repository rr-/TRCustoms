import { useState } from "react";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { ReviewSearchSidebar } from "src/components/common/ReviewSearchSidebar";
import { ReviewsList } from "src/components/common/ReviewsList";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { DISABLE_PAGING } from "src/constants";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: ReviewSearchQuery = {
  levels: [],
  page: DISABLE_PAGING,
  pageSize: 25,
  sort: "-created,level_id",
  search: "",
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): ReviewSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: ReviewSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const ReviewListPage = () => {
  const [searchQuery, setSearchQuery] = useState<ReviewSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Reviews",
      description:
        "Read the latest reviews posted for custom Tomb Raider games.",
      image: "card-reviewer_catalogue.jpg",
    }),
    []
  );

  return (
    <SidebarLayout sidebar={<ReviewSearchSidebar />}>
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Section className="ChildMarginClear">
        <SectionHeader>Latest reviews</SectionHeader>

        <ReviewsList
          showLevels={true}
          showExcerpts={true}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </Section>
    </SidebarLayout>
  );
};

export { ReviewListPage };
