import "./LevelPage.css";
import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { ReviewQuery } from "src/services/level.service";
import type { LevelFull } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import EngineLink from "src/shared/components/EngineLink";
import GenreLink from "src/shared/components/GenreLink";
import Loader from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { MediumThumbnails } from "src/shared/components/MediumThumbnails";
import PushButton from "src/shared/components/PushButton";
import { ReviewsTable } from "src/shared/components/ReviewsTable";
import SectionHeader from "src/shared/components/SectionHeader";
import SidebarBox from "src/shared/components/SidebarBox";
import TagLink from "src/shared/components/TagLink";
import UserLink from "src/shared/components/UserLink";
import { DISABLE_PAGING } from "src/shared/constants";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

const LevelPage = () => {
  const { levelId } = useParams();
  const [reviewsQuery, setReviewsQuery] = useState<ReviewQuery>({
    levels: [+levelId],
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });

  const result = useQuery<LevelFull, Error>(["levels", levelId], async () =>
    LevelService.getLevelById(+levelId)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;

  return (
    <div id="LevelPage">
      <header id="LevelPage--header">
        <h1>{level.name}</h1>
      </header>

      <div id="LevelPage--banner">
        <MediumThumbnail medium={level.banner} />
      </div>

      <aside id="LevelPage--sidebar">
        <SidebarBox
          actions={
            <>
              <PushButton target="_blank" to={level.files[0].url}>
                Download
              </PushButton>
            </>
          }
        >
          <dl id="LevelPage--basicInfo">
            <dt>Author(s)</dt>
            <dd>
              {level.authors.map((author) => (
                <UserLink key={author.id} user={author} />
              ))}
            </dd>

            <hr />

            <dt>Release date</dt>
            <dd>{formatDate(level.created) || "unknown"}</dd>

            <dt>Last updated</dt>
            <dd>{formatDate(level.last_updated) || "never"}</dd>

            <dt>Downloads</dt>
            <dd>{level.download_count}</dd>

            <dt>Engine</dt>
            <dd>
              {level.engine ? (
                <EngineLink engine={level.engine} />
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </dd>

            <dt>Difficulty</dt>
            <dd>{level.new_difficulty?.name || EMPTY_INPUT_PLACEHOLDER}</dd>

            <dt>Duration</dt>
            <dd>{level.new_duration?.name || EMPTY_INPUT_PLACEHOLDER}</dd>

            <hr />

            <dt>Genres</dt>
            <dd>
              {level.genres.length
                ? level.genres.map((genre) => (
                    <GenreLink key={genre.id} genre={genre} />
                  ))
                : EMPTY_INPUT_PLACEHOLDER}
            </dd>

            <dt>Tags</dt>
            <dd>
              {level.tags.length
                ? level.tags.map((tag) => <TagLink key={tag.id} tag={tag} />)
                : EMPTY_INPUT_PLACEHOLDER}
            </dd>

            {level.trle_id && (
              <>
                <dt>Links</dt>
                <dd>
                  <a
                    href={`https://www.trle.net/sc/levelfeatures.php?lid=${level.trle_id}`}
                  >
                    TRLE.net
                  </a>
                </dd>
              </>
            )}
          </dl>

          <SectionHeader>Version history</SectionHeader>
          <table id="LevelPage--fileTable">
            <tbody>
              {level.files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <Link target="_blank" to={file.url}>
                      Version {file.version}
                    </Link>
                  </td>
                  <td>{formatDate(file.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SidebarBox>
      </aside>

      <div id="LevelPage--main">
        <section id="LevelPage--media">
          <MediumThumbnails media={level.media} />
        </section>

        <section id="LevelPage--basicInfo">
          <SectionHeader>About the game</SectionHeader>
          {level.description ? (
            <Markdown children={level.description} />
          ) : (
            <p>This level has no description yet.</p>
          )}
        </section>

        <section id="LevelPage--reviews">
          <ReviewsTable
            showLevels={false}
            showDetails={true}
            showAuthors={true}
            query={reviewsQuery}
            onQueryChange={setReviewsQuery}
          />
        </section>
      </div>
    </div>
  );
};

export default LevelPage;
