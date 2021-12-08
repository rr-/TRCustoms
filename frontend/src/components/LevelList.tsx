import "./LevelList.css";
import { Formik, Form } from "formik";
import { useEffect, useCallback, useState } from "react";
import { useQuery } from "react-query";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Pager from "src/components/Pager";
import {
  ILevelList,
  ILevelTagList,
  ILevelGenreList,
  ILevelEngineList,
  ILevelQuery,
  LevelService,
} from "src/services/level.service";
import CheckboxArrayFormField from "src/shared/components/CheckboxArrayFormField";
import LevelListTable from "src/shared/components/LevelListTable";
import Loader from "src/shared/components/Loader";
import TextFormField from "src/shared/components/TextFormField";
import { filterFalsyObjectValues } from "src/shared/utils";

const defaultQuery: ILevelQuery = {
  page: null,
  sort: null,
  search: "",
  tags: [],
  genres: [],
  engines: [],
};

const deserializeQuery = (search: string): ILevelQuery => {
  const currentURL = new URL(search);
  const qp = Object.fromEntries(currentURL.searchParams);
  return {
    page: +qp.page || null,
    sort: qp.sort || null,
    search: qp.search || "",
    tags: (qp.tags?.split(/,/g) || []).map((item) => +item),
    genres: (qp.genres?.split(/,/g) || []).map((item) => +item),
    engines: (qp.engines?.split(/,/g) || []).map((item) => +item),
  };
};

const serializeQuery = (query: ILevelQuery) => {
  const qp = filterFalsyObjectValues({
    page: query.page,
    sort: query.sort,
    search: query.search,
    tags: query.tags.join(","),
    genres: query.genres.join(","),
    engines: query.engines.join(","),
  }) as any;
  return "?" + new URLSearchParams(qp).toString();
};

const getFormikValues = (query: ILevelQuery) => {
  return {
    search: query.search,
    tags: query.tags,
    genres: query.genres,
    engines: query.engines,
  };
};

const LevelList: React.FunctionComponent = () => {
  const location = useLocation();
  const history = useHistory();
  const [query, setQuery] = useState<ILevelQuery>(
    deserializeQuery(window.location.href)
  );
  const [formikValues, setFormikValues] = useState<any>(getFormikValues(query));

  const levelsQuery = useQuery<ILevelList, Error>(["levels", query], async () =>
    LevelService.getLevels(query)
  );
  const levelTagsQuery = useQuery<ILevelTagList, Error>(
    "levelTags",
    LevelService.getLevelTags
  );
  const levelGenresQuery = useQuery<ILevelGenreList, Error>(
    "levelGenres",
    LevelService.getLevelGenres
  );
  const levelEnginesQuery = useQuery<ILevelEngineList, Error>(
    "levelEngines",
    LevelService.getLevelEngines
  );

  useEffect(() => {
    // synchronize query changes to URL
    if (
      JSON.stringify(deserializeQuery(window.location.href)) !==
      JSON.stringify(query)
    ) {
      history.push(serializeQuery(query));
    }
    setFormikValues(query);
  }, [query, history]);

  useEffect(() => {
    // synchronize URL changes to query
    if (
      JSON.stringify(deserializeQuery(window.location.href)) !==
      JSON.stringify(query)
    ) {
      setQuery(deserializeQuery(window.location.href));
    }
  }, [location, query]);

  const searchClick = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setQuery({
        ...query,
        page: 1,
        search: values.search,
        tags: values.tags,
        genres: values.genres,
        engines: values.engines,
      });
    },
    [query, setQuery]
  );

  const clearClick = useCallback(
    async (resetForm) => {
      setQuery(defaultQuery);
      resetForm();
    },
    [setQuery]
  );

  if (
    !levelTagsQuery.data ||
    !levelGenresQuery.data ||
    !levelEnginesQuery.data
  ) {
    return <Loader />;
  }

  return (
    <div id="LevelList">
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={searchClick}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="LevelList--container">
            <div id="LevelList--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button onClick={clearClick.bind(null, resetForm)} type="reset">
                  Reset
                </button>
              </div>
            </div>

            <aside id="LevelList--sidebar">
              <CheckboxArrayFormField
                label="Tags"
                name="tags"
                source={levelTagsQuery.data.map((tag) => ({
                  value: tag.id,
                  label: tag.name,
                }))}
              />
              <CheckboxArrayFormField
                label="Genres"
                name="genres"
                source={levelGenresQuery.data.map((genre) => ({
                  value: genre.id,
                  label: genre.name,
                }))}
              />
              <CheckboxArrayFormField
                label="Engines"
                name="engines"
                source={levelEnginesQuery.data.map((engine) => ({
                  value: engine.id,
                  label: engine.name,
                }))}
              />
            </aside>

            <div id="LevelList--results">
              <LevelListTable levels={levelsQuery.data} />
            </div>
            <div id="LevelList--pager">
              {levelsQuery.data && <Pager pagedResponse={levelsQuery.data} />}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LevelList;
