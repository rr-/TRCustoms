import "./ReviewsTable.css";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { LevelService } from "src/services/level.service";
import type { Review } from "src/services/level.service";
import type { ReviewList } from "src/services/level.service";
import type { ReviewQuery } from "src/services/level.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import LevelLink from "src/shared/components/LevelLink";
import Loader from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import UserLink from "src/shared/components/UserLink";
import { avg } from "src/shared/math";
import { round } from "src/shared/math";
import { formatDate } from "src/shared/utils";

interface ReviewsTableProps {
  showLevels: boolean;
  showAuthors: boolean;
  showDetails: boolean;
  query: ReviewQuery;
  onQueryChange?: (query: ReviewQuery) => any | null;
}

const ReviewsTable = ({
  showAuthors,
  showLevels,
  showDetails,
  query,
  onQueryChange,
}: ReviewsTableProps) => {
  const result = useQuery<ReviewList, Error>(["reviews", query], async () =>
    LevelService.getReviews(query)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const columns: DataTableColumn<Review>[] = [
    ...(showLevels
      ? [
          {
            name: "level",
            sortKey: "level__name",
            label: "Level",
            itemElement: (review) => <LevelLink level={review.level} />,
          },
        ]
      : []),
    ...(showAuthors
      ? [
          {
            name: "author",
            sortKey: "author__username",
            label: "Author",
            itemElement: (review) => <UserLink user={review.author} />,
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
          {round(
            avg(result.data.results.map((result) => result.rating_gameplay)),
            2
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
          {round(
            avg(result.data.results.map((result) => result.rating_enemies)),
            2
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
          {round(
            avg(result.data.results.map((result) => result.rating_atmosphere)),
            2
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
          {round(
            avg(result.data.results.map((result) => result.rating_lighting)),
            2
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

  const itemKey = (review) => `${review.id}`;

  return (
    <>
      <h2>Legacy reviews</h2>
      <DataTable
        className="ReviewsTable"
        result={result}
        columns={columns}
        itemKey={itemKey}
        sort={query.sort}
        onSortChange={(sort) => onQueryChange?.({ ...query, sort: sort })}
        onPageChange={(page) => onQueryChange?.({ ...query, page: page })}
      />

      {showDetails && (
        <>
          <h2>Reviews</h2>
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
