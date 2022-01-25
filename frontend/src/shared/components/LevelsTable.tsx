import "./LevelsTable.css";
import { ClockIcon } from "@heroicons/react/outline";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import { XCircleIcon } from "@heroicons/react/outline";
import { DownloadIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import type { LevelListing } from "src/services/level.service";
import type { LevelSearchQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";
import { formatFileSize } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface LevelsTableProps {
  showStatus?: boolean;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange?: (searchQuery: LevelSearchQuery) => any | null;
}

const LevelsTable = ({
  showStatus,
  searchQuery,
  onSearchQueryChange,
}: LevelsTableProps) => {
  const columns: DataTableColumn<LevelListing>[] = [
    {
      name: "image",
      label: "Image",
      itemElement: (level) => (
        <>
          <Link className="LevelsTable--previewLink" to={`/levels/${level.id}`}>
            <img
              className="LevelsTable--previewImage"
              src={level.cover.url}
              alt={level.name}
            />
          </Link>
          {showStatus && (
            <>
              {level.is_approved ? (
                <span className="LevelsTable--statusApproved">
                  <BadgeCheckIcon className="icon" /> Approved!
                </span>
              ) : level.rejection_reason ? (
                <span className="LevelsTable--statusRejected">
                  <XCircleIcon className="icon" /> Rejected
                </span>
              ) : (
                <span className="LevelsTable--statusPending">
                  <ClockIcon className="icon" /> Pending approval
                </span>
              )}
            </>
          )}
        </>
      ),
    },
    {
      name: "details",
      label: "Details",
      itemElement: (level) => (
        <>
          <strong>
            <LevelLink level={level} />
          </strong>{" "}
          by{" "}
          <ul className="LevelsTable--authorList">
            {level.authors.map((author) => (
              <li className="LevelsTable--authorListItem">
                <UserLink key={author.id} user={author} />
              </li>
            ))}
          </ul>
          <br />
          <small>
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
        </>
      ),
    },
  ];

  const itemKey = (level: LevelListing) => `${level.id}`;

  return (
    <DataTable
      className="LevelsTable"
      queryName="levels"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={LevelService.searchLevels}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { LevelsTable };
