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
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { InfoMessage } from "src/components/InfoMessage";
import { InfoMessageType } from "src/components/InfoMessage";
import { LevelRating } from "src/components/LevelRating";
import { Loader } from "src/components/Loader";
import { Markdown } from "src/components/Markdown";
import { MediumThumbnails } from "src/components/MediumThumbnails";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { ReviewsList } from "src/components/ReviewsList";
import { Section } from "src/components/Section";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { LevelApprovePushButton } from "src/components/buttons/LevelApprovePushButton";
import { LevelRejectPushButton } from "src/components/buttons/LevelRejectPushButton";
import { EngineLink } from "src/components/links/EngineLink";
import { GenreLink } from "src/components/links/GenreLink";
import { TagLink } from "src/components/links/TagLink";
import { UserLink } from "src/components/links/UserLink";
import { DISABLE_PAGING } from "src/constants";
import { TitleContext } from "src/contexts/TitleContext";
import { UserContext } from "src/contexts/UserContext";
import type { UploadedFile } from "src/services/FileService";
import { ExternalLinkType } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { UserPermission } from "src/services/UserService";
import { DisplayMode } from "src/types";
import { formatFileSize } from "src/utils";
import { formatDate } from "src/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils";

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
                <MediumThumbnails
                  displayMode={DisplayMode.Cover}
                  files={[level.cover]}
                  links={[]}
                />
              ) : null}
            </div>
          }
          actions={
            <>
              {level.last_file?.url && (
                <PushButton
                  to={level.last_file.url}
                  icon={<DownloadIcon className="icon" />}
                >
                  Download ({formatFileSize(level.last_file.size)})
                </PushButton>
              )}
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
          <DefinitionList>
            <DefinitionItemGroup>
              <DefinitionItem term="Author(s)">
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
              </DefinitionItem>

              <DefinitionItem term="Rating">
                <LevelRating ratingClass={level.rating_class} />
              </DefinitionItem>

              <DefinitionItem term="Reviews">
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
              </DefinitionItem>
            </DefinitionItemGroup>

            <DefinitionItemGroup>
              <DefinitionItem term="Release date">
                {formatDate(level.created) || "unknown"}
              </DefinitionItem>

              <DefinitionItem term="Last updated">
                {formatDate(level.last_updated) || "never"}
              </DefinitionItem>

              <DefinitionItem term="Downloads">
                {level.download_count}
              </DefinitionItem>

              {level.trle_id && (
                <DefinitionItem term="Links">
                  <a
                    href={`https://www.trle.net/sc/levelfeatures.php?lid=${level.trle_id}`}
                  >
                    TRLE.net
                  </a>
                </DefinitionItem>
              )}
            </DefinitionItemGroup>

            <DefinitionItemGroup>
              <DefinitionItem term="Engine">
                {level.engine ? (
                  <EngineLink engine={level.engine} />
                ) : (
                  EMPTY_INPUT_PLACEHOLDER
                )}
              </DefinitionItem>

              <DefinitionItem term="Difficulty">
                {level.difficulty?.name || EMPTY_INPUT_PLACEHOLDER}
              </DefinitionItem>

              <DefinitionItem term="Duration">
                {level.duration?.name || EMPTY_INPUT_PLACEHOLDER}
              </DefinitionItem>

              <DefinitionItem term="Genres">
                {level.genres.length ? (
                  <ul className="LevelPage--basicInfoList">
                    {level.genres.map((genre) => (
                      <li
                        key={genre.id}
                        className="LevelPage--basicInfoListItem"
                      >
                        <GenreLink genre={genre} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  EMPTY_INPUT_PLACEHOLDER
                )}
              </DefinitionItem>

              <DefinitionItem term="Tags">
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
              </DefinitionItem>
            </DefinitionItemGroup>

            <DefinitionItem span={true}>
              <SectionHeader>Version history</SectionHeader>
            </DefinitionItem>

            {level.files.length ? (
              level.files
                .sort((a, b) => b.version - a.version)
                .map((file) => (
                  <DefinitionItem
                    key={file.id}
                    term={
                      <span className="LevelPage--fileTableTerm">
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
                      </span>
                    }
                  >
                    {formatDate(file.created)}
                  </DefinitionItem>
                ))
            ) : (
              <DefinitionItem span={true}>
                Downloads for this level are not available.
              </DefinitionItem>
            )}
          </DefinitionList>
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
