import "./LevelSidebar.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { LevelRating } from "src/components/LevelRating";
import { Loader } from "src/components/Loader";
import { MediumThumbnails } from "src/components/MediumThumbnails";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { LevelApprovePushButton } from "src/components/buttons/LevelApprovePushButton";
import { LevelDeletePushButton } from "src/components/buttons/LevelDeletePushButton";
import { LevelRejectPushButton } from "src/components/buttons/LevelRejectPushButton";
import { IconDownload } from "src/components/icons";
import { IconGlobe } from "src/components/icons";
import { IconPencil } from "src/components/icons";
import { IconAnnotation } from "src/components/icons";
import { EngineLink } from "src/components/links/EngineLink";
import { GenreLink } from "src/components/links/GenreLink";
import { TagLink } from "src/components/links/TagLink";
import { UserLink } from "src/components/links/UserLink";
import { UserContext } from "src/contexts/UserContext";
import { ExternalLinkType } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";
import { DisplayMode } from "src/types";
import { formatFileSize } from "src/utils/string";
import { formatDate } from "src/utils/string";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils/string";

interface LevelSidebarProps {
  level: LevelDetails;
  reviewCount: number | undefined;
}

const LevelSidebar = ({ level, reviewCount }: LevelSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const handleDelete = () => {
    navigate("/");
  };

  const handleReviewCountClick = () => {
    document
      .querySelector(".LevelPage--reviews")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const showFileGoneAlert = () =>
    alert("This file is no longer available on our website.");

  const mainLink =
    level.external_links.filter(
      (link) => link.link_type === ExternalLinkType.Main
    )[0]?.url || null;

  return (
    <div className="LevelSidebar">
      <SidebarBox
        header={
          <div className="LevelSidebar--cover">
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
              <PushButton to={level.last_file.url} icon={<IconDownload />}>
                Download ({formatFileSize(level.last_file.size)})
              </PushButton>
            )}
            {mainLink && (
              <PushButton to={mainLink} icon={<IconGlobe />}>
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
              <PushButton icon={<IconPencil />} to={`/levels/${level.id}/edit`}>
                Edit
              </PushButton>
            </PermissionGuard>

            <PermissionGuard require={UserPermission.editLevels}>
              <LevelRejectPushButton level={level} />
              {!level.is_approved && <LevelApprovePushButton level={level} />}
            </PermissionGuard>

            <PermissionGuard require={UserPermission.deleteLevels}>
              <LevelDeletePushButton level={level} onComplete={handleDelete} />
            </PermissionGuard>

            {level.authors.every((author) => author.id !== user?.id) && (
              <PermissionGuard require={UserPermission.reviewLevels}>
                <PushButton
                  icon={<IconAnnotation />}
                  to={`/levels/${level.id}/review`}
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
                <ul className="LevelSidebar--basicInfoList">
                  {level.authors.map((author) => (
                    <li
                      key={author.id}
                      className="LevelSidebar--basicInfoListItem"
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

            <DefinitionItem term="Downloads">
              {level.download_count}
            </DefinitionItem>
          </DefinitionItemGroup>

          <DefinitionItemGroup>
            <DefinitionItem term="Release date">
              {formatDate(level.created) || "unknown"}
            </DefinitionItem>

            <DefinitionItem term="Last updated">
              {formatDate(level.last_updated) || "never"}
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
                <ul className="LevelSidebar--basicInfoList">
                  {level.genres.map((genre) => (
                    <li
                      key={genre.id}
                      className="LevelSidebar--basicInfoListItem"
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
                <ul className="LevelSidebar--basicInfoList">
                  {level.tags.map((tag) => (
                    <li
                      key={tag.id}
                      className="LevelSidebar--basicInfoListItem"
                    >
                      <TagLink tag={tag} />
                    </li>
                  ))}
                </ul>
              ) : (
                EMPTY_INPUT_PLACEHOLDER
              )}
            </DefinitionItem>
          </DefinitionItemGroup>

          <DefinitionItemGroup>
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
                      <span className="LevelSidebar--fileTableTerm">
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
          </DefinitionItemGroup>
        </DefinitionList>
      </SidebarBox>
    </div>
  );
};

export { LevelSidebar };
