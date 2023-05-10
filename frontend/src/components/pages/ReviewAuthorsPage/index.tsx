import { useState } from "react";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { UserFancyList } from "src/components/common/UserFancyList";
import { UserSearch } from "src/components/common/UserSearch";
import { ReviewBasePage } from "src/components/pages/ReviewBasePage";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { UserSearchQuery } from "src/services/UserService";
import { filterFalsyObjectValues } from "src/utils/misc";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: UserSearchQuery = {
  page: null,
  pageSize: 10,
  sort: "-date_joined",
  search: null,
  reviewsMin: 1,
  hideInactiveReviewers: false,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): UserSearchQuery => ({
  ...defaultSearchQuery,
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  hideInactiveReviewers: qp.hide_inactive === "1",
});

const serializeSearchQuery = (
  searchQuery: UserSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    hide_inactive: searchQuery.hideInactiveReviewers === true ? "1" : null,
  });

const ReviewAuthorsPage = () => {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Reviewer catalogue",
      description: "Search for custom level critics.",
      image: "card-reviewer_catalogue.jpg",
    }),
    []
  );

  return (
    <ReviewBasePage>
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Section className="ChildMarginClear">
        <SectionHeader>Reviewer catalogue</SectionHeader>

        <UserSearch
          defaultSearchQuery={defaultSearchQuery}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          showInactiveReviewersCheckbox={true}
        />

        <UserFancyList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </Section>
    </ReviewBasePage>
  );
};

export { ReviewAuthorsPage };
