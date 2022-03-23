import "./LevelsTable.css";
import { ClockIcon } from "@heroicons/react/outline";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import { XCircleIcon } from "@heroicons/react/outline";
import { DownloadIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import { DataList } from "src/components/DataList";
import { LevelRating } from "src/components/LevelRating";
import { LevelAuthorsLink } from "src/components/links/LevelAuthorsLink";
import { LevelLink } from "src/components/links/LevelLink";
import type { LevelListing } from "src/services/LevelService";
import type { LevelSearchQuery } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { formatDate } from "src/utils";
import { formatFileSize } from "src/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils";

interface LevelsTableProps {
  showStatus?: boolean | undefined;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange?: ((searchQuery: LevelSearchQuery) => void) | undefined;
}

interface LevelViewProps {
  showStatus?: boolean | undefined;
  level: LevelListing;
}

const LevelView = ({ showStatus, level }: LevelViewProps) => {
  return (
    <article className="LevelView">
      <Link className="LevelView--coverLink" to={`/levels/${level.id}`}>
        {level.cover ? (
          <img
            className="LevelView--coverImage"
            src={level.cover.url}
            alt={level.name}
          />
        ) : null}
      </Link>

      <div className="LevelView--details">
        <strong>
          <LevelLink level={level} />
        </strong>{" "}
        by <LevelAuthorsLink authors={level.authors} />
        <br />
        {showStatus && (
          <>
            {level.is_approved ? (
              <span className="LevelView--statusApproved">
                <BadgeCheckIcon className="icon" /> Approved!
              </span>
            ) : level.rejection_reason ? (
              <span className="LevelView--statusRejected">
                <XCircleIcon className="icon" /> Rejected
              </span>
            ) : (
              <span className="LevelView--statusPending">
                <ClockIcon className="icon" /> Pending approval
              </span>
            )}
            <br />
          </>
        )}
        <small>
          Reviews: <LevelRating ratingClass={level.rating_class} />
          <br />
          Genres:{" "}
          {level.genres.map((tag) => tag.name).join(", ") ||
            EMPTY_INPUT_PLACEHOLDER}
          <br />
          Engine: {level.engine.name}
          <br />
          Published: {formatDate(level.created)}
          <br />
          Last update: {formatDate(level.last_file?.created || level.created)}
        </small>
        <br />
        Download:{" "}
        {level.last_file?.url ? (
          <>
            <Link target="_blank" to={level.last_file.url}>
              <strong>
                <DownloadIcon className="icon" />(
                {formatFileSize(level.last_file?.size)})
              </strong>
            </Link>{" "}
            ({level.download_count} downloads)
          </>
        ) : (
          <>No download available</>
        )}
      </div>
    </article>
  );
};

const LevelsTable = ({
  showStatus,
  searchQuery,
  onSearchQueryChange,
}: LevelsTableProps) => {
  const itemKey = (level: LevelListing) => `${level.id}`;
  const itemView = (level: LevelListing) => (
    <LevelView showStatus={showStatus} level={level} />
  );

  return (
    <DataList
      className="LevelsTable"
      queryName="levels"
      itemKey={itemKey}
      itemView={itemView}
      searchQuery={searchQuery}
      searchFunc={LevelService.searchLevels}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { LevelsTable };
