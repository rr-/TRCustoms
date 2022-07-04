import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { ReviewsList } from "src/components/ReviewsList";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
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
      <Section>
        <SectionHeader>Latest reviews</SectionHeader>
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
  );
};

export { ReviewListPage };
