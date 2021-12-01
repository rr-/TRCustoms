import "./LevelList.css";
import { Formik, Form } from "formik";
import { useEffect, useCallback, useState } from "react";
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
  const [levels, setLevels] = useState<ILevelList | null>(null);
  const [levelTags, setLevelTags] = useState<ILevelTagList | null>(null);
  const [levelGenres, setLevelGenres] = useState<ILevelGenreList | null>(null);
  const [levelEngines, setLevelEngines] = useState<ILevelEngineList | null>(
    null
  );
  const [formikValues, setFormikValues] = useState<any>(getFormikValues(query));

  const fetchLevelTags = useCallback(async () => {
    setLevelTags(await LevelService.getLevelTags());
  }, []);

  const fetchLevelGenres = useCallback(async () => {
    setLevelGenres(await LevelService.getLevelGenres());
  }, []);

  const fetchLevelEngines = useCallback(async () => {
    setLevelEngines(await LevelService.getLevelEngines());
  }, []);

  const fetchLevels = useCallback(async () => {
    const levels = await LevelService.getLevels(query);
    setLevels(levels);
  }, [query]);

  useEffect(() => {
    fetchLevelTags();
  }, [fetchLevelTags]);
  useEffect(() => {
    fetchLevelGenres();
  }, [fetchLevelGenres]);
  useEffect(() => {
    fetchLevelEngines();
  }, [fetchLevelEngines]);

  useEffect(() => {
    fetchLevels();
  }, [query, fetchLevels]);

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
  }, [location]);

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

  return (
    <div id="LevelList">
      {levelTags && levelGenres && levelEngines ? (
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
                  <button
                    onClick={clearClick.bind(null, resetForm)}
                    type="reset"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <aside id="LevelList--sidebar">
                <CheckboxArrayFormField
                  label="Tags"
                  name="tags"
                  source={levelTags.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                  }))}
                />
                <CheckboxArrayFormField
                  label="Genres"
                  name="genres"
                  source={levelGenres.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                  }))}
                />
                <CheckboxArrayFormField
                  label="Engines"
                  name="engines"
                  source={levelEngines.map((engine) => ({
                    value: engine.id,
                    label: engine.name,
                  }))}
                />
              </aside>

              <div id="LevelList--results">
                <LevelListTable levels={levels} />
              </div>
              <div id="LevelList--pager">
                {levels && <Pager pagedResponse={levels} />}
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default LevelList;
