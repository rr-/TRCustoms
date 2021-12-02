import "./LevelListTable.css";
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
              <th class="LevelListTable--name">
                <LevelSortLink sort={"name"}>Name</LevelSortLink>
              </th>
              <th>Genres</th>
              <th class="LevelListTable--genres">
                <LevelSortLink sort={"author"}>Author</LevelSortLink>
              </th>
              <th class="LevelListTable--engine">
                <LevelSortLink sort={"engine_name"}>Engine</LevelSortLink>
              </th>
              <th class="LevelListTable--created">
                <LevelSortLink sort={"created"}>Created</LevelSortLink>
              </th>
              <th class="LevelListTable--updated">
                <LevelSortLink sort={"last_updated"}>
                  Last updated
                </LevelSortLink>
              </th>
            </tr>
          </thead>
          <tbody>
            {levels.results.map((level) => (
              <tr key={level.id}>
                <td class="LevelListTable--name">{level.name}</td>
                <td class="LevelListTable--genres">
                  {level.genres.map((tag) => tag.name).join(", ") || "N/A"}
                </td>
                <td class="LevelListTable--author">
                  {level.author_user?.username || level.author_name || "N/A"}
                </td>
                <td class="LevelListTable--engine">{level.engine.name}</td>
                <td class="LevelListTable--created">
                  {formatDate(level.created) || "N/A"}
                </td>
                <td class="LevelListTable--updated">
                  {formatDate(level.last_updated) || "N/A"}
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
