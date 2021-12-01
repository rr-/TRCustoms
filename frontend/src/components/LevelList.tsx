import "./LevelList.css";
import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import LevelSortLink from "src/components/LevelSortLink";
import Pager from "src/components/Pager";
import { ILevelList, LevelService } from "src/services/level.service";
import { formatDateTime } from "src/shared/utils";

const LevelList: React.FunctionComponent = () => {
  const [levelList, setLevelList] = useState<ILevelList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const fetchLevelList = useCallback(async (queryParams) => {
    const levelList = await LevelService.getLevels({
      page: queryParams.page || 1,
      sort: queryParams.sort || null,
      search: queryParams.search || null,
    });
    setLevelList(levelList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const queryParams = Object.fromEntries(
      new URL(window.location.href).searchParams
    );
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
              {levelList.results.map((level) => (
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
          <Pager pagedResponse={levelList} />
        </div>
      )}
    </>
  );
};

export default LevelList;
