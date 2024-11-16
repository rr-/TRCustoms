import styles from "./index.module.css";
import { DataList } from "src/components/common/DataList";
import { LevelRating } from "src/components/common/LevelRating";
import { Link } from "src/components/common/Link";
import { IconClock } from "src/components/icons";
import { IconBadgeCheck } from "src/components/icons";
import { IconXCircle } from "src/components/icons";
import { IconDownload } from "src/components/icons";
import { LevelAuthorsLink } from "src/components/links/LevelAuthorsLink";
import { LevelLink } from "src/components/links/LevelLink";
import type { LevelListing } from "src/services/LevelService";
import type { LevelSearchQuery } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { formatDate } from "src/utils/string";
import { formatFileSize } from "src/utils/string";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils/string";
import { pluralize } from "src/utils/string";

interface LevelListProps {
  showStatus?: boolean | undefined;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange?: ((searchQuery: LevelSearchQuery) => void) | undefined;
}

interface LevelViewProps {
  showStatus?: boolean | undefined;
  level: LevelListing;
}

const LevelView = ({ showStatus, level }: LevelViewProps) => {
  const author = (
    <>
      <strong>
        <LevelLink level={level} />
      </strong>{" "}
      by <LevelAuthorsLink authors={level.authors} />
    </>
  );

  const status = (
    <>
      {level.is_approved ? (
        <span className={`${styles.status} ${styles.approved}`}>
          <IconBadgeCheck /> Approved!
        </span>
      ) : level.rejection_reason ? (
        <span className={`${styles.status} ${styles.rejected}`}>
          <IconXCircle /> Rejected
        </span>
      ) : (
        <span className={`${styles.status} ${styles.pending}`}>
          <IconClock /> Pending approval
        </span>
      )}
      <br />
    </>
  );

  const details = (
    <small className={styles.details}>
      Rating: <LevelRating ratingClass={level.rating_class} /> (
      {level.rating_count} {pluralize("rating", level.rating_count)}
      {" and "}
      {level.review_count} {pluralize("review", level.review_count)})
      <br />
      Genres:{" "}
      {level.genres.map((tag) => tag.name).join(", ") ||
        EMPTY_INPUT_PLACEHOLDER}
      <br />
      Engine: {level.engine.name}
      <br />
      <span className={styles.publishedDate}>
        Published: {formatDate(level.created)}
      </span>
      {level.last_user_content_updated &&
      formatDate(level.created) !==
        formatDate(level.last_user_content_updated) ? (
        <span className={styles.updatedDate}>
          Updated: {formatDate(level.last_user_content_updated)}
        </span>
      ) : null}
    </small>
  );

  const download = (
    <>
      {level.last_file?.url ? (
        <span className={styles.downloadBox}>
          Download:
          <span className={styles.downloadLink}>
            <Link to={level.last_file.url}>
              <strong>
                <IconDownload />
                {formatFileSize(level.last_file?.size)}
              </strong>
            </Link>
          </span>
          <small className={styles.downloadCount}>
            {level.download_count} downloads
          </small>
        </span>
      ) : (
        <>No download available</>
      )}
    </>
  );

  return (
    <article className={styles.wrapper}>
      <Link className={styles.coverLink} to={`/levels/${level.id}`}>
        <div className={styles.coverImageWrapper}>
          {level.cover ? (
            <img
              className={styles.coverImage}
              src={level.cover.url}
              alt={level.name}
            />
          ) : null}
        </div>
      </Link>

      <div className={styles.description}>
        {author}
        <br />
        {showStatus && status}

        {details}

        {download}
      </div>
    </article>
  );
};

const LevelList = ({
  showStatus,
  searchQuery,
  onSearchQueryChange,
}: LevelListProps) => {
  const itemKey = (level: LevelListing) => `${level.id}`;
  const itemView = (level: LevelListing) => (
    <LevelView showStatus={showStatus} level={level} />
  );

  return (
    <DataList
      queryName="levels"
      itemKey={itemKey}
      itemView={itemView}
      searchQuery={searchQuery}
      searchFunc={LevelService.searchLevels}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { LevelList };
