import { ILevelList } from "src/services/level.service";
import LevelSortLink from "src/shared/components/LevelSortLink";
import Loader from "src/shared/components/Loader";
import { formatDateTime } from "src/shared/utils";

const LevelListTable = ({ levels }: { levels: ILevelList | null }) => {
  return (
    <>
      {!levels ? (
        <Loader />
      ) : (
        <table className="LevelListTable">
          <thead>
            <tr>
              <th>
                <LevelSortLink sort={"name"}>Name</LevelSortLink>
              </th>
              <th>Genres</th>
              <th>
                <LevelSortLink sort={"author"}>Author</LevelSortLink>
              </th>
              <th>
                <LevelSortLink sort={"engine_name"}>Engine</LevelSortLink>
              </th>
              <th>
                <LevelSortLink sort={"created"}>Created</LevelSortLink>
              </th>
              <th>
                <LevelSortLink sort={"last_updated"}>
                  Last updated
                </LevelSortLink>
              </th>
            </tr>
          </thead>
          <tbody>
            {levels.results.map((level) => (
              <tr key={level.id}>
                <td>{level.name}</td>
                <td>
                  {level.genres.map((tag) => tag.name).join(", ") || "N/A"}
                </td>
                <td>
                  {level.author_user?.username || level.author_name || "N/A"}
                </td>
                <td>{level.engine.name}</td>
                <td>{formatDateTime(level.created)}</td>
                <td>{formatDateTime(level.last_updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default LevelListTable;
