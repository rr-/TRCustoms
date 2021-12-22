import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import type { GenreQuery } from "src/services/level.service";
import { GenresTable } from "src/shared/components/GenresTable";
import { QueryPersister } from "src/shared/components/QueryPersister";
import { deserializeGenericQuery } from "src/shared/components/QueryPersister";
import { serializeGenericQuery } from "src/shared/components/QueryPersister";
import { SearchBar } from "src/shared/components/SearchBar";
import TextFormField from "src/shared/components/TextFormField";

const defaultQuery: GenreQuery = {
  page: null,
  sort: null,
  search: null,
};

const convertQueryToFormikValues = (query: GenreQuery) => {
  return { search: query.search || "" };
};

const GenreListPage = () => {
  const [query, setQuery] = useState<GenreQuery>(
    deserializeGenericQuery(window.location.href)
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
        search: values.search || null,
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
    <div id="GenreListPage">
      <QueryPersister
        serializeQuery={serializeGenericQuery}
        deserializeQuery={deserializeGenericQuery}
        query={query}
        setQuery={setQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={searchClick}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="GenreListPage--container">
            <SearchBar id="GenreListPage--search">
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

            <div id="GenreListPage--results">
              <GenresTable query={query} />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default GenreListPage;
