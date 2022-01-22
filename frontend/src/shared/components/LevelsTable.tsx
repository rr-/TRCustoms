import "./LevelsTable.css";
import { DownloadIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";
import type { Level } from "src/services/level.service";
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
  searchQuery: LevelSearchQuery;
  onSearchQueryChange?: (searchQuery: LevelSearchQuery) => any | null;
}

const LevelsTable = ({
  searchQuery,
  onSearchQueryChange,
}: LevelsTableProps) => {
  const columns: DataTableColumn<Level>[] = [
    {
      name: "image",
      label: "Image",
      itemElement: (level) => (
        <Link className="LevelsTable--previewLink" to={`/levels/${level.id}`}>
          <img
            className="LevelsTable--previewImage"
            src={level.cover.url}
            alt={level.name}
          />
        </Link>
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
          {level.authors.map((author) => (
            <UserLink key={author.id} user={author} />
          ))}
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

  const itemKey = (level: Level) => `${level.id}`;

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
