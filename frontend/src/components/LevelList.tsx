import "./LevelList.css";
import { Formik, Form } from "formik";
import { useEffect, useCallback, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import LevelSortLink from "src/components/LevelSortLink";
import Pager from "src/components/Pager";
import { ILevelList, LevelService } from "src/services/level.service";
import TextFormField from "src/shared/components/TextFormField";
import { filterFalsyObjectValues, formatDateTime } from "src/shared/utils";

const LevelList: React.FunctionComponent = () => {
  const [levelList, setLevelList] = useState<ILevelList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();

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
    const currentURL = new URL(window.location.href);
    const queryParams = Object.fromEntries(currentURL.searchParams);
    fetchLevelList(queryParams);
  }, [fetchLevelList, location]);

  const searchClick = async (values: any) => {
    const currentURL = new URL(window.location.href);
    const queryParams = Object.fromEntries(currentURL.searchParams);
    const targetURL =
      "?" +
      new URLSearchParams(
        filterFalsyObjectValues({
          sort: queryParams.sort,
          search: values.search,
        })
      ).toString();
    history.push(targetURL);
  };

  const clearClick = async (values: any) => {
    history.push("");
  };

  return (
    <>
      {isLoading || !levelList ? (
        <p>Loading...</p>
      ) : (
        <div id="LevelList">
          <Formik initialValues={{ search: "" }} onSubmit={searchClick}>
            <Form className="Form">
              <TextFormField label="Search" name="search" />
              <div className="FormField">
                <button type="submit">Search</button>
                <button onClick={clearClick} type="reset">
                  Reset
                </button>
              </div>
            </Form>
          </Formik>

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
