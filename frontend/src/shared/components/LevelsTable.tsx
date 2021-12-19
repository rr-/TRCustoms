import "./LevelsTable.css";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import Pager from "src/components/Pager";
import { ILevelList, ILevelAuthor } from "src/services/level.service";
import { ILevelQuery } from "src/services/level.service";
import { LevelService } from "src/services/level.service";
import Loader from "src/shared/components/Loader";
import SortLink from "src/shared/components/SortLink";
import { DISABLE_PAGING } from "src/shared/types";
import { formatDate } from "src/shared/utils";
import { formatFileSize } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

function getAuthorsTooltip(authors: ILevelAuthor[]): string | null {
  if (authors.length > 1) {
    return authors.map((author) => author.username).join(", ");
  }
  return null;
}

function renderAuthors(authors: ILevelAuthor[]): React.ReactElement {
  if (authors.length > 1) {
    return <>Multiple authors</>;
  }
  let user = authors[0];
  if (!user?.username) {
    return <>{EMPTY_INPUT_PLACEHOLDER}</>;
  }
  return <Link to={`/profile/${user.id}`}>{user.username}</Link>;
}

const LevelsTable = ({ query }: { query: ILevelQuery | null }) => {
  const levelsQuery = useQuery<ILevelList, Error>(["levels", query], async () =>
    LevelService.getLevels(query)
  );

  if (levelsQuery.error) {
    return <p>{levelsQuery.error.message}</p>;
  }

  if (levelsQuery.isLoading || !levelsQuery.data) {
    return <Loader />;
  }

  if (!levelsQuery.data.results.length) {
    return <p>There are no levels to show.</p>;
  }

  return (
    <>
      <table className="LevelsTable borderless">
        <thead>
          <tr>
            <th className="LevelsTable--name">
              <SortLink sort={"name"}>Name</SortLink>
            </th>
            <th>Genres</th>
            <th className="LevelsTable--genres">Author(s)</th>
            <th className="LevelsTable--engine">
              <SortLink sort={"engine_name"}>Engine</SortLink>
            </th>
            <th className="LevelsTable--created">
              <SortLink sort={"created"}>Created</SortLink>
            </th>
            <th
              className="LevelsTable--updated"
              title="Date of last file upload"
            >
              <SortLink sort={"last_file_created"}>Last updated</SortLink>
            </th>
            <th className="LevelsTable--size">
              <SortLink sort={"last_file_size"}>Size</SortLink>
            </th>
            <th className="LevelsTable--download">Download</th>
          </tr>
        </thead>
        <tbody>
          {levelsQuery.data.results.map((level) => (
            <tr key={level.id}>
              <td className="LevelsTable--name">{level.name}</td>
              <td className="LevelsTable--genres">
                {level.genres.map((tag) => tag.name).join(", ") || "N/A"}
              </td>
              <td
                className="LevelsTable--author"
                title={getAuthorsTooltip(level.authors)}
              >
                {renderAuthors(level.authors)}
              </td>
              <td className="LevelsTable--engine">{level.engine.name}</td>
              <td className="LevelsTable--created">
                {formatDate(level.created)}
              </td>
              <td className="LevelsTable--updated">
                {formatDate(level.last_file_created)}
              </td>
              <td className="LevelsTable--size">
                {formatFileSize(level.last_file_size)}
              </td>
              <td className="LevelsTable--download">
                {level.last_file_id ? (
                  <Link
                    target="_blank"
                    to={`/api/level_files/${level.last_file_id}/download`}
                  >
                    Download
                  </Link>
                ) : (
                  <>{EMPTY_INPUT_PLACEHOLDER}</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {query.page !== DISABLE_PAGING && (
        <div id="LevelList--pager">
          <Pager pagedResponse={levelsQuery.data} />
        </div>
      )}
    </>
  );
};

export default LevelsTable;
