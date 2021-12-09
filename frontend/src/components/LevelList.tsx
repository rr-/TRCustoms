import "./LevelList.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LevelEnginesCheckboxes from "src/components/LevelEnginesCheckboxes";
import LevelGenresCheckboxes from "src/components/LevelGenresCheckboxes";
import LevelTagsCheckboxes from "src/components/LevelTagsCheckboxes";
import { ILevelQuery } from "src/services/level.service";
import LevelListTable from "src/shared/components/LevelListTable";
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
              <LevelTagsCheckboxes />
              <LevelGenresCheckboxes />
              <LevelEnginesCheckboxes />
            </aside>

            <div id="LevelList--results">
              <LevelListTable query={query} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LevelList;
