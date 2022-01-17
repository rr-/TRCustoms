import "./ReviewsTable.css";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { ReviewService } from "src/services/review.service";
import type { Review } from "src/services/review.service";
import type { ReviewSearchResult } from "src/services/review.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { avg } from "src/shared/math";
import { round } from "src/shared/math";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface ReviewsTableProps {
  showLevels: boolean;
  showAuthors: boolean;
  showDetails: boolean;
  searchQuery: ReviewSearchQuery;
  onSearchQueryChange?: (searchQuery: ReviewSearchQuery) => any | null;
}

const ReviewsTable = ({
  showAuthors,
  showLevels,
  showDetails,
  searchQuery,
  onSearchQueryChange,
}: ReviewsTableProps) => {
  const result = useQuery<ReviewSearchResult, Error>(
    ["reviews", ReviewService.searchReviews, searchQuery],
    async () => ReviewService.searchReviews(searchQuery)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const getAverage = <T extends Object>(
    source: T[],
    mapper: (item: T) => number
  ) => {
    return source.length
      ? round(avg(source.map(mapper)), 2)
      : EMPTY_INPUT_PLACEHOLDER;
  };

  const columns: DataTableColumn<Review>[] = [
    ...(showLevels
      ? [
          {
            name: "level",
            sortKey: "level__name",
            label: "Level",
            itemElement: (review: Review) => <LevelLink level={review.level} />,
          },
        ]
      : []),
    ...(showAuthors
      ? [
          {
            name: "author",
            sortKey: "author__username",
            label: "Author",
            itemElement: (review: Review) => <UserLink user={review.author} />,
          },
        ]
      : []),
    {
      name: "ratingGameplay",
      sortKey: "rating_gameplay",
      label: "Gameplay & puzzles",
      itemElement: (review) => `${review.rating_gameplay}`,
      footer: () => (
        <>
          {getAverage(
            result?.data?.results || [],
            (review) => review.rating_gameplay
          )}
        </>
      ),
    },
    {
      name: "ratingEnemies",
      sortKey: "rating_enemies",
      label: "Enemies, objects & secrets",
      itemElement: (review) => `${review.rating_enemies}`,
      footer: () => (
        <>
          {getAverage(
            result?.data?.results || [],
            (review) => review.rating_enemies
          )}
        </>
      ),
    },
    {
      name: "ratingAtmosphere",
      sortKey: "rating_atmosphere",
      label: "Atmosphere, sound & cameras",
      itemElement: (review) => `${review.rating_atmosphere}`,
      footer: () => (
        <>
          {getAverage(
            result?.data?.results || [],
            (review) => review.rating_atmosphere
          )}
        </>
      ),
    },
    {
      name: "ratingLighting",
      sortKey: "rating_lighting",
      label: "Lighting & textures",
      itemElement: (review) => `${review.rating_lighting}`,
      footer: () => (
        <>
          {getAverage(
            result?.data?.results || [],
            (review) => review.rating_lighting
          )}
        </>
      ),
    },
    {
      name: "created",
      sortKey: "created",
      label: "Published",
      itemElement: (review) => formatDate(review.created),
    },
  ];

  const itemKey = (review: Review) => `${review.id}`;

  return (
    <>
      <SectionHeader>Legacy ratings</SectionHeader>
      <DataTable
        className="ReviewsTable"
        queryName="reviews"
        columns={columns}
        itemKey={itemKey}
        searchQuery={searchQuery}
        searchFunc={ReviewService.searchReviews}
        onSearchQueryChange={onSearchQueryChange}
      />

      {showDetails && (
        <>
          <SectionHeader>Reviews</SectionHeader>
          {result.data.results.length ? (
            result.data.results.map(
              (review) =>
                review.text && (
                  <Fragment key={review.id}>
                    <Markdown children={review.text} />—{" "}
                    <em>
                      <UserLink user={review.author} />,{" "}
                      {formatDate(review.created)}
                    </em>
                    <hr />
                  </Fragment>
                )
            )
          ) : (
            <p>There are no result to show.</p>
          )}
        </>
      )}
    </>
  );
};

export { ReviewsTable };
