import "./index.css";
import { useState } from "react";
import { Link } from "src/components/common/Link";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { ReviewsList } from "src/components/common/ReviewsList";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
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

  usePageMetadata(() => ({ ready: true, title: "Reviews" }), []);

  return (
    <div className="ReviewListPage">
      <div className="ReviewListPage--sidebar">
        <SidebarBox>
          <Section className="ChildMarginClear">
            <SectionHeader>Reviewer catalogue</SectionHeader>
            <Link to={`/reviews/authors`}>
              <img src="/reviewer_catalogue.jpg" alt="Reviewer catalogue" />
              Find reviewers
            </Link>
          </Section>

          <Section className="ChildMarginClear">
            <SectionHeader>Least reviewed levels</SectionHeader>
            <Link to={`/reviews/level_suggestions`}>
              <img
                src="/least_reviewed_levels.jpg"
                alt="Least reviewed levels"
              />
              Review less known levels
            </Link>
            <p>
              A list of levels with less than 5 reviews, sorted by the oldest
              release date.
            </p>
          </Section>
        </SidebarBox>
      </div>
      <div className="ReviewListPage--main">
        <Section className="ChildMarginClear">
          <SectionHeader className="ReviewListPage--sectionHeader">
            Latest reviews
          </SectionHeader>
          <QueryPersister
            serializeSearchQuery={serializeSearchQuery}
            deserializeSearchQuery={deserializeSearchQuery}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <ReviewsList
            showLevels={true}
            showExcerpts={true}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </Section>
      </div>
    </div>
  );
};

export { ReviewListPage };
