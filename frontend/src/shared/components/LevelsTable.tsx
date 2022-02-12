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
import { LevelRating } from "src/shared/components/LevelRating";
import { LevelLink } from "src/shared/components/links/LevelLink";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";
import { formatFileSize } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface LevelsTableProps {
  showStatus?: boolean | undefined;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange?: ((searchQuery: LevelSearchQuery) => void) | undefined;
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
      itemElement: ({ item }) => (
        <>
          <Link className="LevelsTable--previewLink" to={`/levels/${item.id}`}>
            <img
              className="LevelsTable--previewImage"
              src={item.cover.url}
              alt={item.name}
            />
          </Link>
        </>
      ),
    },
    {
      name: "details",
      label: "Details",
      itemElement: ({ item }) => (
        <>
          <strong>
            <LevelLink level={item} />
          </strong>{" "}
          by{" "}
          {item.authors.length > 1 ? (
            <span
              title={item.authors.map((author) => author.username).join(", ")}
            >
              Multiple authors
            </span>
          ) : item.authors.length === 1 ? (
            <UserLink user={item.authors[0]} />
          ) : (
            "Unknown"
          )}
          <br />
          {showStatus && (
            <>
              {item.is_approved ? (
                <span className="LevelsTable--statusApproved">
                  <BadgeCheckIcon className="icon" /> Approved!
                </span>
              ) : item.rejection_reason ? (
                <span className="LevelsTable--statusRejected">
                  <XCircleIcon className="icon" /> Rejected
                </span>
              ) : (
                <span className="LevelsTable--statusPending">
                  <ClockIcon className="icon" /> Pending approval
                </span>
              )}
              <br />
            </>
          )}
          <small>
            Reviews: <LevelRating ratingClass={item.rating_class} />
            <br />
            Genres:{" "}
            {item.genres.map((tag) => tag.name).join(", ") ||
              EMPTY_INPUT_PLACEHOLDER}
            <br />
            Engine: {item.engine.name}
            <br />
            Published: {formatDate(item.created)}
            <br />
            Last update: {formatDate(item.last_file?.created || item.created)}
          </small>
          <br />
          Download:{" "}
          {item.last_file?.url ? (
            <>
              <Link target="_blank" to={item.last_file.url}>
                <strong>
                  <DownloadIcon className="icon" />(
                  {formatFileSize(item.last_file?.size)})
                </strong>
              </Link>{" "}
              ({item.download_count} downloads)
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
