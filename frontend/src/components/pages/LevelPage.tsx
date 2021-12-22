import "./LevelPage.css";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import type { LevelFull } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import Loader from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { MediumThumbnails } from "src/shared/components/MediumThumbnails";
import { ReviewsTable } from "src/shared/components/ReviewsTable";
import { DISABLE_PAGING } from "src/shared/types";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

const LevelPage = () => {
  const { levelId } = useParams();
  const levelQuery = useQuery<LevelFull, Error>(["levels", levelId], async () =>
    LevelService.getLevelById(+levelId)
  );

  if (levelQuery.error) {
    return <p>{levelQuery.error.message}</p>;
  }

  if (levelQuery.isLoading || !levelQuery.data) {
    return <Loader />;
  }

  const level = levelQuery.data;

  return (
    <div id="LevelPage">
      <header id="LevelPage--header">
        <h1>{level.name}</h1>
      </header>

      <aside id="LevelPage--sidebar">
        <MediumThumbnail medium={level.banner} />

        <dl>
          <dt>Author(s)</dt>
          <dd>
            {level.authors.map((author) => (
              <Link key={author.id} to={`/users/${author.id}`}>
                {author.username}
              </Link>
            ))}
          </dd>

          <hr />

          <dt>Release date</dt>
          <dd>{formatDate(level.created) || "unknown"}</dd>

          <dt>Last updated</dt>
          <dd>{formatDate(level.last_updated) || "never"}</dd>

          <dt>Engine</dt>
          <dd>
            {level.engine ? (
              <Link to={`/levels/?engines=${level.engine.id}`}>
                {level.engine.name}
              </Link>
            ) : (
              EMPTY_INPUT_PLACEHOLDER
            )}
          </dd>

          <dt>Difficulty</dt>
          <dd>
            {level.difficulty ? level.difficulty : EMPTY_INPUT_PLACEHOLDER}
          </dd>

          <dt>Duration</dt>
          <dd>{level.duration ? level.duration : EMPTY_INPUT_PLACEHOLDER}</dd>

          <hr />

          <dt>Genres</dt>
          <dd>
            {level.genres.length
              ? level.genres.map((genre) => (
                  <Link key={genre.id} to={`/?genres=${genre.id}`}>
                    {genre.name}
                  </Link>
                ))
              : EMPTY_INPUT_PLACEHOLDER}
          </dd>

          <dt>Tags</dt>
          <dd>
            {level.tags.length
              ? level.tags.map((tag) => (
                  <Link key={tag.id} to={`/?tags=${tag.id}`}>
                    {tag.name}
                  </Link>
                ))
              : EMPTY_INPUT_PLACEHOLDER}
          </dd>
        </dl>
      </aside>

      <div id="LevelPage--main">
        <section id="LevelPage--media">
          <MediumThumbnails media={level.media} />
        </section>

        <section id="LevelPage--basic-info">
          <h2>About the game</h2>
          {level.description ? (
            <Markdown children={level.description} />
          ) : (
            <p>This level has no description yet.</p>
          )}
        </section>

        <section id="LevelPage--reviews">
          <ReviewsTable
            query={{
              levels: [level.id],
              page: DISABLE_PAGING,
              sort: "",
              search: "",
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default LevelPage;
