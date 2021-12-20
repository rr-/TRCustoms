import "./LevelsTable.css";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { ILevel } from "src/services/level.service";
import { ILevelList } from "src/services/level.service";
import { ILevelQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import { IDataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { formatDate } from "src/shared/utils";
import { formatFileSize } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

const LevelsTable = ({ query }: { query: ILevelQuery | null }) => {
  const levelsQuery = useQuery<ILevelList, Error>(["levels", query], async () =>
    LevelService.getLevels(query)
  );

  const columns: IDataTableColumn<ILevel>[] = [
    {
      name: "name",
      label: "Name",
      sortKey: "name",
      itemElement: (level) => (
        <Link to={`/levels/${level.id}`}>{level.name}</Link>
      ),
    },
    {
      name: "genres",
      label: "Genres",
      itemElement: (level) =>
        level.genres.map((tag) => tag.name).join(", ") ||
        EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "authors",
      label: "Author(s)",
      itemTooltip: (level) => {
        if (level.authors.length > 1) {
          return level.authors.map((author) => author.username).join(", ");
        }
        return null;
      },
      itemElement: (level) => {
        if (level.authors.length > 1) {
          return "Multiple authors";
        }
        const user = level.authors[0];
        if (!user?.username) {
          return EMPTY_INPUT_PLACEHOLDER;
        }
        return <Link to={`/users/${user.id}`}>{user.username}</Link>;
      },
    },
    {
      name: "engine",
      label: "Engine",
      sortKey: "engine",
      itemElement: (level) => level.engine.name,
    },
    {
      name: "created",
      label: "Created",
      sortKey: "created",
      itemElement: (level) => formatDate(level.created),
    },
    {
      name: "updated",
      sortKey: "last_file_created",
      tooltip: "Date of last file upload",
      label: "Last updated",
      itemElement: (level) => formatDate(level.last_file_created),
    },
    {
      name: "size",
      sortKey: "last_file_size",
      label: "Size",
      itemElement: (level) => formatFileSize(level.last_file_size),
    },
    {
      name: "download",
      label: "Download",
      itemElement: (level) =>
        level.last_file_id ? (
          <Link
            target="_blank"
            to={`/api/level_files/${level.last_file_id}/download`}
          >
            Download
          </Link>
        ) : (
          EMPTY_INPUT_PLACEHOLDER
        ),
    },
  ];

  const itemKey = (level) => `${level.id}`;

  return (
    <DataTable
      className="LevelsTable"
      query={levelsQuery}
      columns={columns}
      itemKey={itemKey}
    />
  );
};

export default LevelsTable;
