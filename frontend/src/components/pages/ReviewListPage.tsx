import "./ReviewListPage.css";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { PushButton } from "src/components/PushButton";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { ReviewsList } from "src/components/ReviewsList";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { DISABLE_PAGING } from "src/constants";
import { TitleContext } from "src/contexts/TitleContext";
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
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<ReviewSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  useEffect(() => {
    setTitle("Reviews");
  }, [setTitle]);

  return (
    <div className="ReviewListPage">
      <div className="ReviewListPage--sidebar">
        <SidebarBox>
          <Section className="ChildMarginClear">
            <SectionHeader>Least reviewed levels</SectionHeader>
            <PushButton
              to={`/reviews/level_suggestions`}
              isPlain={true}
              disableTimeout={true}
            >
              Review less known levels
            </PushButton>
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
