import "./LevelList.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import EnginesCheckboxes from "src/components/EnginesCheckboxes";
import GenresCheckboxes from "src/components/GenresCheckboxes";
import TagsCheckboxes from "src/components/TagsCheckboxes";
import { ILevelQuery } from "src/services/level.service";
import LevelsTable from "src/shared/components/LevelsTable";
import { QueryPersister } from "src/shared/components/QueryPersister";
import { SearchBar } from "src/shared/components/SearchBar";
import TextFormField from "src/shared/components/TextFormField";
import { filterFalsyObjectValues } from "src/shared/utils";

const defaultQuery: ILevelQuery = {
  page: null,
  sort: null,
  search: "",
  tags: [],
  genres: [],
  engines: [],
  authors: [],
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
    authors: [],
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

const convertQueryToFormikValues = (query: ILevelQuery) => {
  return {
    search: query.search,
    tags: query.tags,
    genres: query.genres,
    engines: query.engines,
  };
};

const LevelList: React.FunctionComponent = () => {
  const [query, setQuery] = useState<ILevelQuery>(
    deserializeQuery(window.location.href)
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertQueryToFormikValues(query)
  );

  useEffect(() => setFormikValues(convertQueryToFormikValues(query)), [query]);

  const searchClick = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setQuery({
        ...query,
        page: null,
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
      <QueryPersister
        serializeQuery={serializeQuery}
        deserializeQuery={deserializeQuery}
        query={query}
        setQuery={setQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={searchClick}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="LevelList--container">
            <SearchBar id="LevelList--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button onClick={clearClick.bind(null, resetForm)} type="reset">
                  Reset
                </button>
              </div>
            </SearchBar>

            <aside id="LevelList--sidebar">
              <TagsCheckboxes />
              <GenresCheckboxes />
              <EnginesCheckboxes />
            </aside>

            <div id="LevelList--results">
              <LevelsTable query={query} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LevelList;
