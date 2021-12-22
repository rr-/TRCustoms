import "./ReviewsTable.css";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { LevelService } from "src/services/level.service";
import type { Review } from "src/services/level.service";
import type { ReviewList } from "src/services/level.service";
import type { ReviewQuery } from "src/services/level.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import Loader from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { avg } from "src/shared/math";
import { round } from "src/shared/math";
import { formatDate } from "src/shared/utils";

interface ReviewsTableProps {
  query: ReviewQuery;
}

const ReviewsTable = ({ query }: ReviewsTableProps) => {
  const reviewsQuery = useQuery<ReviewList, Error>(
    ["reviews", query],
    async () => LevelService.getReviews(query)
  );

  if (reviewsQuery.error) {
    return <p>{reviewsQuery.error.message}</p>;
  }

  if (reviewsQuery.isLoading || !reviewsQuery.data) {
    return <Loader />;
  }

  const columns: DataTableColumn<Review>[] = [
    {
      name: "author",
      label: "Author",
      itemElement: (review) => (
        <Link to={`/profile/${review.author.id}`}>
          {review.author.username}
        </Link>
      ),
    },
    {
      name: "ratingGameplay",
      label: "Gameplay & puzzles",
      itemElement: (review) => `${review.rating_gameplay}`,
      footer: () => (
        <>
          {round(
            avg(
              reviewsQuery.data.results.map((result) => result.rating_gameplay)
            ),
            2
          )}
        </>
      ),
    },
    {
      name: "ratingEnemies",
      label: "Enemies, objects & secrets",
      itemElement: (review) => `${review.rating_enemies}`,
      footer: () => (
        <>
          {round(
            avg(
              reviewsQuery.data.results.map((result) => result.rating_enemies)
            ),
            2
          )}
        </>
      ),
    },
    {
      name: "ratingAtmosphere",
      label: "Atmosphere, sound & cameras",
      itemElement: (review) => `${review.rating_atmosphere}`,
      footer: () => (
        <>
          {round(
            avg(
              reviewsQuery.data.results.map(
                (result) => result.rating_atmosphere
              )
            ),
            2
          )}
        </>
      ),
    },
    {
      name: "ratingLighting",
      label: "Lighting & textures",
      itemElement: (review) => `${review.rating_lighting}`,
      footer: () => (
        <>
          {round(
            avg(
              reviewsQuery.data.results.map((result) => result.rating_lighting)
            ),
            2
          )}
        </>
      ),
    },
    {
      name: "created",
      label: "Published",
      itemElement: (review) => formatDate(review.created),
    },
  ];

  const itemKey = (review) => `${review.id}`;

  return (
    <>
      <h2>Reviews</h2>
      <DataTable
        className="ReviewsTable"
        query={reviewsQuery}
        columns={columns}
        itemKey={itemKey}
      />

      <h2>Reviewer comments</h2>
      {reviewsQuery.data.results.map((review) => (
        <Fragment key={review.id}>
          <Markdown children={review.text} />—{" "}
          <em>
            {review.author.username}, {formatDate(review.created)}
          </em>
          <hr />
        </Fragment>
      ))}
    </>
  );
};

export { ReviewsTable };
