import "./LevelList.css";
import { parse } from "qs";
import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Pager from "src/components/Pager";
import { ILevelList, LevelService } from "src/services/level.service";
import { formatDateTime } from "src/shared/utils";

const LevelList: React.FunctionComponent = () => {
  const [levelList, setLevelList] = useState<ILevelList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  let location = useLocation();

  const fetchLevelList = useCallback(async (queryParams) => {
    const levelList = await LevelService.getLevels({
      page: queryParams.page || 1,
    });
    setLevelList(levelList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const queryParams = parse(location.search, { ignoreQueryPrefix: true });
    fetchLevelList(queryParams);
  }, [fetchLevelList, location]);

  return (
    <>
      {isLoading || !levelList ? (
        <p>Loading...</p>
      ) : (
        <div id="LevelList">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Genres</th>
                <th>Tags</th>
                <th>Author</th>
                <th>Engine</th>
                <th>Created</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {levelList.results.map((level) => (
                <tr>
                  <td>{level.name}</td>
                  <td>
                    {level.genres.map((tag) => tag.name).join(", ") || "N/A"}
                  </td>
                  <td>
                    {level.tags.map((tag) => tag.name).join(", ") || "N/A"}
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
          <Pager
            pagedResponse={levelList}
            linkElem={(page, label) => (
              <Link to={{ pathname: "/", search: `?page=${page}` }}>
                {label}
              </Link>
            )}
          />
        </div>
      )}
    </>
  );
};

export default LevelList;
