import { useState } from "react";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { LevelList } from "src/components/common/LevelList";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { ReviewBasePage } from "src/components/pages/ReviewBasePage";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { LevelSearchQuery } from "src/services/LevelService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  difficulties: [],
  durations: [],
  ratings: [],
  isApproved: true,
  reviewsMax: 5,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...defaultSearchQuery,
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const ReviewLevelSuggestionsPage = () => {
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(
    () => ({
      ready: true,
      title: "Less known levels",
      description:
        "Find levels that don't have a lot of reviews, there might be a hidden gem somewhere.",
      image: "card-least_reviewed_levels.jpg",
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
        <SectionHeader>Least reviewed levels</SectionHeader>

        <InfoMessage type={InfoMessageType.Info}>
          This is a list of levels with low amounts of reviews.
        </InfoMessage>

        <LevelList
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </Section>
    </ReviewBasePage>
  );
};

export { ReviewLevelSuggestionsPage };
