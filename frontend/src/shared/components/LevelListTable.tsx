import "./LevelListTable.css";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import Pager from "src/components/Pager";
import { ILevelList } from "src/services/level.service";
import { ILevelQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import LevelSortLink from "src/shared/components/LevelSortLink";
import Loader from "src/shared/components/Loader";
import { formatDate } from "src/shared/utils";
import { formatFileSize } from "src/shared/utils";

const LevelListTable = ({ query }: { query: ILevelQuery | null }) => {
  const levelsQuery = useQuery<ILevelList, Error>(["levels", query], async () =>
    LevelService.getLevels(query)
  );

  if (levelsQuery.isLoading || !levelsQuery.data) {
    return <Loader />;
  }

  if (levelsQuery.error) {
    return <p>{levelsQuery.error.message}</p>;
  }

  return (
    <>
      <table className="LevelListTable">
        <thead>
          <tr>
            <th className="LevelListTable--name">
              <LevelSortLink sort={"name"}>Name</LevelSortLink>
            </th>
            <th>Genres</th>
            <th className="LevelListTable--genres">
              <LevelSortLink sort={"author"}>Author</LevelSortLink>
            </th>
            <th className="LevelListTable--engine">
              <LevelSortLink sort={"engine_name"}>Engine</LevelSortLink>
            </th>
            <th className="LevelListTable--created">
              <LevelSortLink sort={"created"}>Created</LevelSortLink>
            </th>
            <th
              className="LevelListTable--updated"
              title="Date of last file upload"
            >
              <LevelSortLink sort={"last_file_created"}>
                Last updated
              </LevelSortLink>
            </th>
            <th className="LevelListTable--size">
              <LevelSortLink sort={"last_file_size"}>Size</LevelSortLink>
            </th>
            <th className="LevelListTable--download">Download</th>
          </tr>
        </thead>
        <tbody>
          {levelsQuery.data.results.map((level) => (
            <tr key={level.id}>
              <td className="LevelListTable--name">{level.name}</td>
              <td className="LevelListTable--genres">
                {level.genres.map((tag) => tag.name).join(", ") || "N/A"}
              </td>
              <td className="LevelListTable--author">
                {level.author_user?.username || level.author_name || "N/A"}
              </td>
              <td className="LevelListTable--engine">{level.engine.name}</td>
              <td className="LevelListTable--created">
                {formatDate(level.created) || "N/A"}
              </td>
              <td className="LevelListTable--updated">
                {formatDate(level.last_file_created) || "N/A"}
              </td>
              <td className="LevelListTable--size">
                {level.last_file_size ? (
                  <>{formatFileSize(level.last_file_size) || "N/A"}</>
                ) : (
                  <>N/A</>
                )}
              </td>
              <td className="LevelListTable--download">
                {level.last_file_id ? (
                  <Link
                    target="_blank"
                    to={`/api/level_files/${level.last_file_id}/download`}
                  >
                    Download
                  </Link>
                ) : (
                  <>N/A</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div id="LevelList--pager">
        <Pager pagedResponse={levelsQuery.data} />
      </div>
    </>
  );
};

export default LevelListTable;
