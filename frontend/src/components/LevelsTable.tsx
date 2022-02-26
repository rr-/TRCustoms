import "./LevelsTable.css";
import { ClockIcon } from "@heroicons/react/outline";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import { XCircleIcon } from "@heroicons/react/outline";
import { DownloadIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import type { DataTableColumn } from "src/components/DataTable";
import { DataTable } from "src/components/DataTable";
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
            {item.cover ? (
              <img
                className="LevelsTable--previewImage"
                src={item.cover.url}
                alt={item.name}
              />
            ) : null}
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
          by <LevelAuthorsLink authors={item.authors} />
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
