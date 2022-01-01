import "./LevelPage.css";
import { Fragment } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import type { LevelFull } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { ReviewSearchQuery } from "src/services/review.service";
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
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >({
    levels: [+levelId],
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });

  const result = useQuery<LevelFull, Error>(
    [LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;
  const downloadableFiles = level.files.filter((file) => !!file.url);

  const showFileGoneAlert = () =>
    alert("This file is no longer available on our website.");

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
              {downloadableFiles.length ? (
                <PushButton target="_blank" to={downloadableFiles[0].url}>
                  Download
                </PushButton>
              ) : level.files.length ? (
                <PushButton onClick={() => showFileGoneAlert()}>
                  Download
                </PushButton>
              ) : null}
            </>
          }
        >
          <dl id="LevelPage--basicInfo">
            <dt>Author(s)</dt>
            <dd>
              {level.tags.length ? (
                <ul className="LevelPage--basicInfoList">
                  {level.authors.map((author) => (
                    <li
                      key={author.id}
                      className="LevelPage--basicInfoListItem"
                    >
                      <UserLink user={author} />
                    </li>
                  ))}
                </ul>
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </dd>

            <div>
              <hr />
            </div>

            <dt>Release date</dt>
            <dd>{formatDate(level.created) || "unknown"}</dd>

            <dt>Last updated</dt>
            <dd>{formatDate(level.last_updated) || "never"}</dd>

            <dt>Downloads</dt>
            <dd>{level.download_count}</dd>

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

            <div>
              <hr />
            </div>

            <dt>Engine</dt>
            <dd>
              {level.engine ? (
                <EngineLink engine={level.engine} />
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </dd>

            <dt>Difficulty</dt>
            <dd>{level.difficulty?.name || EMPTY_INPUT_PLACEHOLDER}</dd>

            <dt>Duration</dt>
            <dd>{level.duration?.name || EMPTY_INPUT_PLACEHOLDER}</dd>

            <dt>Genres</dt>
            <dd>
              {level.genres.length ? (
                <ul className="LevelPage--basicInfoList">
                  {level.genres.map((genre) => (
                    <li key={genre.id} className="LevelPage--basicInfoListItem">
                      <GenreLink genre={genre} />
                    </li>
                  ))}
                </ul>
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </dd>

            <dt>Tags</dt>
            <dd>
              {level.tags.length ? (
                <ul className="LevelPage--basicInfoList">
                  {level.tags.map((tag) => (
                    <li key={tag.id} className="LevelPage--basicInfoListItem">
                      <TagLink tag={tag} />
                    </li>
                  ))}
                </ul>
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </dd>

            <div>
              <SectionHeader>Version history</SectionHeader>
            </div>

            {level.files.map((file) => (
              <Fragment key={file.id}>
                <dt className="LevelPage--fileTableTerm">
                  {file.url ? (
                    <Link target="_blank" to={file.url}>
                      Version {file.version}
                    </Link>
                  ) : (
                    <button
                      className="link"
                      onClick={() => showFileGoneAlert()}
                    >
                      Version {file.version}
                    </button>
                  )}
                </dt>
                <dd>{formatDate(file.created)}</dd>
              </Fragment>
            ))}
          </dl>
        </SidebarBox>
      </aside>

      <div id="LevelPage--main">
        {!!level.media.length && (
          <section id="LevelPage--media">
            <MediumThumbnails media={level.media} />
          </section>
        )}

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
            searchQuery={reviewsSearchQuery}
            onSearchQueryChange={setReviewsSearchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export default LevelPage;
