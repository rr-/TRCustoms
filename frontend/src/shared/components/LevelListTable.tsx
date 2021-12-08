import "./LevelListTable.css";
import { Link } from "react-router-dom";
import { ILevelList } from "src/services/level.service";
import LevelSortLink from "src/shared/components/LevelSortLink";
import Loader from "src/shared/components/Loader";
import { formatDate } from "src/shared/utils";

const LevelListTable = ({ levels }: { levels: ILevelList | null }) => {
  return (
    <>
      {!levels ? (
        <Loader />
      ) : (
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
              <th className="LevelListTable--updated">
                <LevelSortLink sort={"last_updated"}>
                  Last updated
                </LevelSortLink>
              </th>
              <th className="LevelListTable--download">Download</th>
            </tr>
          </thead>
          <tbody>
            {levels.results.map((level) => (
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
                  {formatDate(level.last_updated) || "N/A"}
                </td>
                <td className="LevelListTable--download">
                  {level.download_url ? (
                    <Link target="_blank" to={level.download_url}>
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
      )}
    </>
  );
};

export default LevelListTable;
