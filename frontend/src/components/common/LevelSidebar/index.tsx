import "./index.css";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LevelApproveButton } from "src/components/buttons/LevelApproveButton";
import { LevelDeleteButton } from "src/components/buttons/LevelDeleteButton";
import { LevelRejectButton } from "src/components/buttons/LevelRejectButton";
import { Button } from "src/components/common/Button";
import { DefinitionItemGroup } from "src/components/common/DefinitionList";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { LevelRating } from "src/components/common/LevelRating";
import { Loader } from "src/components/common/Loader";
import { MediumThumbnails } from "src/components/common/MediumThumbnails";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { IconDownload } from "src/components/icons";
import { IconBook } from "src/components/icons";
import { IconGlobe } from "src/components/icons";
import { IconPencil } from "src/components/icons";
import { IconAnnotation } from "src/components/icons";
import { EngineLink } from "src/components/links/EngineLink";
import { GenreLink } from "src/components/links/GenreLink";
import { TagLink } from "src/components/links/TagLink";
import { UserLink } from "src/components/links/UserLink";
import { WalkthroughsModal } from "src/components/modals/WalkthroughsModal";
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
  const [isWalkthroughsModalActive, setIsWalkthroughsModalActive] = useState(
    false
  );
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

  const handleWalkthroughsButtonClick = () => {
    setIsWalkthroughsModalActive(true);
  };

  const showFileGoneAlert = () =>
    alert("This file is no longer available on our website.");

  const mainLink =
    level.external_links.filter(
      (link) => link.link_type === ExternalLinkType.Main
    )[0]?.url || null;

  return (
    <div className="LevelSidebar">
      <WalkthroughsModal
        level={level}
        isActive={isWalkthroughsModalActive}
        onIsActiveChange={setIsWalkthroughsModalActive}
      />

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
              <Button to={level.last_file.url} icon={<IconDownload />}>
                Download ({formatFileSize(level.last_file.size)})
              </Button>
            )}
            {mainLink && (
              <Button to={mainLink} icon={<IconGlobe />}>
                Website
              </Button>
            )}
            <PermissionGuard
              require={UserPermission.editLevels}
              owningUsers={[
                ...level.authors,
                ...(level.uploader ? [level.uploader] : []),
              ]}
            >
              <Button icon={<IconPencil />} to={`/levels/${level.id}/edit`}>
                Edit
              </Button>
            </PermissionGuard>

            <PermissionGuard require={UserPermission.editLevels}>
              <LevelRejectButton level={level} />
              {!level.is_approved && <LevelApproveButton level={level} />}
            </PermissionGuard>

            <PermissionGuard require={UserPermission.deleteLevels}>
              <LevelDeleteButton level={level} onComplete={handleDelete} />
            </PermissionGuard>

            <Button icon={<IconBook />} onClick={handleWalkthroughsButtonClick}>
              Walkthrough
            </Button>

            {level.authors.every((author) => author.id !== user?.id) && (
              <PermissionGuard require={UserPermission.reviewLevels}>
                <Button
                  icon={<IconAnnotation />}
                  to={`/levels/${level.id}/review`}
                >
                  Review
                </Button>
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
                <Button
                  isPlain={true}
                  disableTimeout={true}
                  onClick={handleReviewCountClick}
                >
                  {reviewCount}
                </Button>
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
                          <Button isPlain={true} to={file.url}>
                            Version {file.version}
                          </Button>
                        ) : (
                          <Button
                            isPlain={true}
                            onClick={() => showFileGoneAlert()}
                          >
                            Version {file.version}
                          </Button>
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
