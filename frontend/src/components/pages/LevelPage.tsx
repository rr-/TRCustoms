import "./LevelPage.css";
import { DownloadIcon } from "@heroicons/react/outline";
import { PencilIcon } from "@heroicons/react/outline";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import { ExclamationIcon } from "@heroicons/react/outline";
import axios from "axios";
import { AxiosError } from "axios";
import { Fragment } from "react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import type { LevelFull } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import type { SnapshotSearchQuery } from "src/services/snapshot.service";
import { UserPermission } from "src/services/user.service";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { MediumThumbnails } from "src/shared/components/MediumThumbnails";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { ReviewsTable } from "src/shared/components/ReviewsTable";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { SnapshotsTable } from "src/shared/components/SnapshotsTable";
import { EngineLink } from "src/shared/components/links/EngineLink";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { TagLink } from "src/shared/components/links/TagLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { DISABLE_PAGING } from "src/shared/constants";
import { formatFileSize } from "src/shared/utils";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface LevelPageParams {
  levelId: string;
}

const LevelPage = () => {
  const { levelId } = (useParams() as unknown) as LevelPageParams;
  const queryClient = useQueryClient();
  const [snapshotsSearchQuery, setSnapshotsSearchQuery] = useState<
    SnapshotSearchQuery
  >({
    level: +levelId,
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >({
    levels: [+levelId],
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });

  const result = useQuery<LevelFull, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const setLevelApproval = async (isApproved: boolean) => {
    try {
      if (isApproved) {
        await LevelService.approve(+levelId);
      } else {
        await LevelService.disapprove(+levelId);
      }

      result.refetch();
      queryClient.removeQueries("levels");
      queryClient.removeQueries("snapshots");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        alert(axiosError.response?.data.detail || "Unknown error");
      } else {
        alert("Unknown error");
      }
    }
  };

  const level = result.data;
  const downloadableFiles = level.files.filter((file) => !!file.url);

  const showFileGoneAlert = () =>
    alert("This file is no longer available on our website.");

  return (
    <div id="LevelPage">
      <header id="LevelPage--header">
        <h1 className="LevelPage--headerWrapper">
          {level.name.split(/(\s*[:-]\s*)/).map((word, i) => (
            <span key={i} className="LevelPage--headerPart">
              {word}
            </span>
          ))}
        </h1>
      </header>

      <div id="LevelPage--cover">
        <MediumThumbnail file={level.cover} />
      </div>

      <aside id="LevelPage--sidebar">
        <SidebarBox
          actions={
            <>
              {downloadableFiles.length > 0 ? (
                <PushButton
                  to={downloadableFiles[0].url}
                  icon={<DownloadIcon className="icon" />}
                >
                  Download ({formatFileSize(downloadableFiles[0].size)})
                </PushButton>
              ) : level.files.length > 0 ? (
                <PushButton
                  onClick={() => showFileGoneAlert()}
                  icon={<DownloadIcon className="icon" />}
                >
                  Download
                </PushButton>
              ) : null}
              <PermissionGuard
                require={UserPermission.editLevels}
                owningUsers={[
                  ...level.authors,
                  ...(level.uploader ? [level.uploader] : []),
                ]}
              >
                <PushButton
                  icon={<PencilIcon className="icon" />}
                  to={`/levels/${levelId}/edit`}
                >
                  Edit
                </PushButton>
              </PermissionGuard>

              <PermissionGuard require={UserPermission.editLevels}>
                <PushButton
                  icon={
                    level.is_approved ? (
                      <ExclamationIcon className="icon" />
                    ) : (
                      <BadgeCheckIcon className="icon" />
                    )
                  }
                  onClick={() => setLevelApproval(!level.is_approved)}
                >
                  {level.is_approved ? "Disapprove" : "Approve"}
                </PushButton>
              </PermissionGuard>
            </>
          }
        >
          <dl id="LevelPage--basicInfo">
            <dt>Author(s)</dt>
            <dd>
              {level.authors.length ? (
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

            {level.files.length ? (
              level.files
                .sort((a, b) => b.version - a.version)
                .map((file) => (
                  <Fragment key={file.id}>
                    <dt className="LevelPage--fileTableTerm">
                      {file.url ? (
                        <PushButton isPlain={true} to={file.url}>
                          Version {file.version}
                        </PushButton>
                      ) : (
                        <PushButton
                          isPlain={true}
                          onClick={() => showFileGoneAlert()}
                        >
                          Version {file.version}
                        </PushButton>
                      )}
                    </dt>
                    <dd>{formatDate(file.created)}</dd>
                  </Fragment>
                ))
            ) : (
              <div>Downloads for this level are not available.</div>
            )}
          </dl>
        </SidebarBox>
      </aside>

      <div id="LevelPage--main">
        {!!level.screenshots.length && (
          <section id="LevelPage--media">
            <MediumThumbnails media={level.screenshots} />
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

        <section id="LevelPage--changes">
          <SectionHeader>Changes history</SectionHeader>
          <SnapshotsTable
            showObjects={false}
            showApprovalButton={true}
            searchQuery={snapshotsSearchQuery}
            onSearchQueryChange={setSnapshotsSearchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export { LevelPage };
