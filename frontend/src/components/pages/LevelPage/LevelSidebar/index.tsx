import styles from "./index.module.css";
import { useContext } from "react";
import { PlaylistAddButton } from "src/components/buttons/PlaylistAddButton";
import { Button } from "src/components/common/Button";
import { ButtonVariant } from "src/components/common/Button";
import { DefinitionItemGroup } from "src/components/common/DefinitionList";
import { DefinitionItem } from "src/components/common/DefinitionList";
import { DefinitionList } from "src/components/common/DefinitionList";
import { LevelRating } from "src/components/common/LevelRating";
import { Link } from "src/components/common/Link";
import { MediumThumbnails } from "src/components/common/MediumThumbnails";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { VerticalList } from "src/components/common/VerticalList";
import { IconDownload } from "src/components/icons";
import { IconGlobe } from "src/components/icons";
import { EngineLink } from "src/components/links/EngineLink";
import { GenreLink } from "src/components/links/GenreLink";
import { TagLink } from "src/components/links/TagLink";
import { UserLink } from "src/components/links/UserLink";
import { UserContext } from "src/contexts/UserContext";
import { ExternalLinkType } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";
import { DisplayMode } from "src/types";
import { formatFileSize } from "src/utils/string";
import { formatDate } from "src/utils/string";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils/string";

interface LevelSidebarProps {
  level: LevelDetails;
}

const LevelSidebar = ({ level }: LevelSidebarProps) => {
  const { user } = useContext(UserContext);

  const showFileGoneAlert = () =>
    alert("This file is no longer available on our website.");

  const mainLink =
    level.external_links.filter(
      (link) => link.link_type === ExternalLinkType.Main
    )[0]?.url || null;

  const header = (
    <VerticalList gap="big">
      {level.cover ? (
        <MediumThumbnails
          className={styles.cover}
          displayMode={DisplayMode.Cover}
          files={[level.cover]}
          links={[]}
        />
      ) : null}

      <VerticalList>
        {level.last_file?.url && (
          <Button
            variant={ButtonVariant.Important}
            to={level.last_file.url}
            icon={<IconDownload />}
          >
            Download{" "}
            <span className={styles.nowrap}>
              ({formatFileSize(level.last_file.size)})
            </span>
          </Button>
        )}
        {mainLink && (
          <Button
            variant={ButtonVariant.Important}
            to={mainLink}
            icon={<IconGlobe />}
          >
            Website
          </Button>
        )}

        {user && (
          <PlaylistAddButton
            variant={ButtonVariant.Important}
            userId={user.id}
            level={level}
          />
        )}
      </VerticalList>
    </VerticalList>
  );

  const levelProperties = (
    <DefinitionList>
      <DefinitionItemGroup>
        <DefinitionItem term="Author(s)">
          {level.authors.length ? (
            <ul className={styles.basicInfoList}>
              {level.authors.map((author) => (
                <li key={author.id} className={styles.basicInfoListItem}>
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
          {" "}({level.rating_count})
        </DefinitionItem>

        <DefinitionItem term="Reviews">{level.review_count}</DefinitionItem>

        <DefinitionItem term="Downloads">{level.download_count}</DefinitionItem>
      </DefinitionItemGroup>

      <DefinitionItemGroup>
        <DefinitionItem term="Release date">
          {level.created ? formatDate(level.created) : "unknown"}
        </DefinitionItem>

        {level.last_user_content_updated ? (
          <DefinitionItem term="Last updated">
            {formatDate(level.last_user_content_updated)}
          </DefinitionItem>
        ) : null}

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
            <ul className={styles.basicInfoList}>
              {level.genres.map((genre) => (
                <li key={genre.id} className={styles.basicInfoListItem}>
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
            <ul className={styles.basicInfoList}>
              {level.tags.map((tag) => (
                <li key={tag.id} className={styles.basicInfoListItem}>
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
                  <span className={styles.fileTableTerm}>
                    {file.url ? (
                      <Link enableTimeout={true} to={file.url}>
                        Version {file.version}
                      </Link>
                    ) : (
                      <Link
                        enableTimeout={true}
                        onClick={() => showFileGoneAlert()}
                      >
                        Version {file.version}
                      </Link>
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
  );

  return (
    <div className={styles.wrapper}>
      <SidebarBox
        header={<div className={styles.potentialColumn}>{header}</div>}
      >
        <div className={styles.potentialColumn}>{levelProperties}</div>
      </SidebarBox>
    </div>
  );
};

export { LevelSidebar };
