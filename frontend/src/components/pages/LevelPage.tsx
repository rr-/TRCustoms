import "./LevelPage.css";
import { DownloadIcon } from "@heroicons/react/outline";
import { GlobeAltIcon } from "@heroicons/react/outline";
import { PencilIcon } from "@heroicons/react/outline";
import { AnnotationIcon } from "@heroicons/react/outline";
import { useEffect } from "react";
import { useContext } from "react";
import { Fragment } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import type { UploadedFile } from "src/services/file.service";
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
import { Section } from "src/shared/components/Section";
import { SectionHeader } from "src/shared/components/Section";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { LevelApprovePushButton } from "src/shared/components/buttons/LevelApprovePushButton";
import { LevelRejectPushButton } from "src/shared/components/buttons/LevelRejectPushButton";
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
    <div className="LevelPage">
      <header className="LevelPage--header">
        <h1 className="LevelPage--headerWrapper">
          {level.name.split(/(\s*[:-]\s*)/).map((word, i) => (
            <span key={i} className="LevelPage--headerPart">
              {word}
            </span>
          ))}
        </h1>
      </header>

      <aside className="LevelPage--sidebar">
        <SidebarBox
          header={
            <div className="LevelPage--cover">
              {level.cover ? (
                <MediumThumbnail
                  displayMode={DisplayMode.Cover}
                  file={level.cover}
                />
              ) : null}
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
                {(level.is_approved || !level.rejection_reason) && (
                  <LevelRejectPushButton level={level} />
                )}
                {!level.is_approved && <LevelApprovePushButton level={level} />}
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
          <dl className="LevelPage--basicInfo">
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

      <div className="LevelPage--main">
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
          <Section className="LevelPage--media">
            <MediumThumbnails
              displayMode={DisplayMode.Contain}
              files={level.screenshots
                .filter((screenshot) => !!screenshot.file)
                .map((screenshot) => screenshot.file as UploadedFile)}
              links={showcaseLinks}
            />
          </Section>
        )}

        <Section className="LevelPage--basicInfo">
          <SectionHeader>About the game</SectionHeader>
          {level.description ? (
            <Markdown>{level.description}</Markdown>
          ) : (
            <p>This level has no description yet.</p>
          )}
        </Section>

        <Section className="LevelPage--reviews">
          <SectionHeader>Reviews</SectionHeader>
          <ReviewsList
            showLevels={false}
            searchQuery={reviewsSearchQuery}
            onResultCountChange={setReviewCount}
            onSearchQueryChange={setReviewsSearchQuery}
          />
        </Section>
      </div>
    </div>
  );
};

export { LevelPage };
