import "./LevelPage.css";
import { DownloadIcon } from "@heroicons/react/outline";
import { GlobeAltIcon } from "@heroicons/react/outline";
import { PencilIcon } from "@heroicons/react/outline";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import { XCircleIcon } from "@heroicons/react/outline";
import { AnnotationIcon } from "@heroicons/react/outline";
import axios from "axios";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useContext } from "react";
import { Fragment } from "react";
import { useState } from "react";
import { useQueryClient } from "react-query";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { ExternalLinkType } from "src/services/level.service";
import type { LevelDetails } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { ReviewSearchQuery } from "src/services/review.service";
import { UserPermission } from "src/services/user.service";
import { InfoMessage } from "src/shared/components/InfoMessage";
import { InfoMessageType } from "src/shared/components/InfoMessage";
import { LevelRating } from "src/shared/components/LevelRating";
import { Loader } from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { MediumThumbnail } from "src/shared/components/MediumThumbnail";
import { MediumThumbnails } from "src/shared/components/MediumThumbnails";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { ReviewsList } from "src/shared/components/ReviewsList";
import { SectionHeader } from "src/shared/components/SectionHeader";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { EngineLink } from "src/shared/components/links/EngineLink";
import { GenreLink } from "src/shared/components/links/GenreLink";
import { TagLink } from "src/shared/components/links/TagLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { DISABLE_PAGING } from "src/shared/constants";
import { TitleContext } from "src/shared/contexts/TitleContext";
import { UserContext } from "src/shared/contexts/UserContext";
import { DisplayMode } from "src/shared/types";
import { formatFileSize } from "src/shared/utils";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface LevelPageParams {
  levelId: string;
}

const LevelPage = () => {
  const { user } = useContext(UserContext);
  const { setTitle } = useContext(TitleContext);
  const { levelId } = (useParams() as unknown) as LevelPageParams;
  const queryClient = useQueryClient();
  const [reviewCount, setReviewCount] = useState<number | undefined>();
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >({
    levels: [+levelId],
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  useEffect(() => {
    setTitle(result?.data?.name || "");
  }, [setTitle, result]);

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const handleApproveButtonClick = async () => {
    if (!window.confirm("Are you sure you want to approve this level?")) {
      return;
    }
    try {
      await LevelService.approve(+levelId);
      result.refetch();
      queryClient.removeQueries("levels");
      queryClient.removeQueries("auditLogs");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        alert(axiosError.response?.data.detail || "Unknown error");
      } else {
        alert("Unknown error");
      }
    }
  };

  const handleRejectButtonClick = async () => {
    const reason = prompt(
      "Please provide the reason for rejecting this level."
    );
    if (!reason) {
      return;
    }
    try {
      await LevelService.reject(+levelId, reason);
      result.refetch();
      queryClient.removeQueries("levels");
      queryClient.removeQueries("auditLogs");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        alert(axiosError.response?.data.detail || "Unknown error");
      } else {
        alert("Unknown error");
      }
    }
  };

  const handleReviewCountClick = () => {
    document
      .getElementsByClassName("ReviewsList")[0]
      .scrollIntoView({ behavior: "smooth" });
  };

  const level = result.data;
  const downloadableFiles = level.files.filter((file) => !!file.url);
  const mainLink =
    level.external_links.filter(
      (link) => link.link_type === ExternalLinkType.Main
    )[0]?.url || null;
  const showcaseLinks = level.external_links
    .filter((link) => link.link_type === ExternalLinkType.Showcase)
    .map((link) => link.url);

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

      <aside id="LevelPage--sidebar">
        <SidebarBox
          header={
            <div id="LevelPage--cover">
              <MediumThumbnail
                displayMode={DisplayMode.Cover}
                file={level.cover}
              />
            </div>
          }
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
              {mainLink && (
                <PushButton
                  to={mainLink}
                  icon={<GlobeAltIcon className="icon" />}
                >
                  Website
                </PushButton>
              )}
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
                {level.is_approved ? (
                  <PushButton
                    icon={<XCircleIcon className="icon" />}
                    onClick={handleRejectButtonClick}
                    tooltip="Hides this level from the level listing."
                  >
                    Reject
                  </PushButton>
                ) : (
                  <PushButton
                    icon={<BadgeCheckIcon className="icon" />}
                    onClick={handleApproveButtonClick}
                    tooltip="Shows this level from the level listing."
                  >
                    Approve
                  </PushButton>
                )}
              </PermissionGuard>

              {level.authors.every((author) => author.id !== user?.id) && (
                <PermissionGuard require={UserPermission.reviewLevels}>
                  <PushButton
                    icon={<AnnotationIcon className="icon" />}
                    to={`/levels/${levelId}/review`}
                  >
                    Review
                  </PushButton>
                </PermissionGuard>
              )}
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
            <dt>Rating</dt>
            <dd>
              <LevelRating ratingClass={level.rating_class} />
            </dd>

            <dt>Reviews</dt>
            <dd>
              {reviewCount !== undefined ? (
                <PushButton
                  isPlain={true}
                  disableTimeout={true}
                  onClick={handleReviewCountClick}
                >
                  {reviewCount}
                </PushButton>
              ) : (
                <Loader inline={true} />
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
        {level.is_approved || (
          <InfoMessage type={InfoMessageType.Warning}>
            {level.rejection_reason ? (
              <>
                This level was rejected by staff. Reason:{" "}
                {level.rejection_reason}
              </>
            ) : (
              <>This level is currently pending approval.</>
            )}
          </InfoMessage>
        )}

        {!!level.screenshots.length && (
          <section id="LevelPage--media">
            <MediumThumbnails
              displayMode={DisplayMode.Contain}
              files={level.screenshots.map((screenshot) => screenshot.file)}
              links={showcaseLinks}
            />
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
          <ReviewsList
            showLevels={false}
            searchQuery={reviewsSearchQuery}
            onResultCountChange={setReviewCount}
            onSearchQueryChange={setReviewsSearchQuery}
          />
        </section>
      </div>
    </div>
  );
};

export { LevelPage };
