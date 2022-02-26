import { Formik } from "formik";
import { Form } from "formik";
import { useContext } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { GenresTable } from "src/components/GenresTable";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { SearchBar } from "src/components/SearchBar";
import { TextFormField } from "src/components/formfields/TextFormField";
import { TitleContext } from "src/contexts/TitleContext";
import type { GenreSearchQuery } from "src/services/GenreService";
import { getCurrentSearchParams } from "src/utils";

const defaultSearchQuery: GenreSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const convertSearchQueryToFormikValues = (searchQuery: GenreSearchQuery) => {
  return { search: searchQuery.search || "" };
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): GenreSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: GenreSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const GenreListPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<GenreSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(() => {
    setTitle("Genres");
  }, [setTitle]);

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setSearchQuery({
        ...searchQuery,
        page: null,
        search: values.search || null,
      });
    },
    [searchQuery, setSearchQuery]
  );

  const handleReset = useCallback(
    async (resetForm) => {
      setSearchQuery(defaultSearchQuery);
      resetForm();
    },
    [setSearchQuery]
  );

  return (
    <div id="GenreListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="GenreListPage--container">
            <SearchBar id="GenreListPage--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button
                  onClick={handleReset.bind(null, resetForm)}
                  type="reset"
                >
                  Reset
                </button>
              </div>
            </SearchBar>

            <div id="GenreListPage--results">
              <GenresTable
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { GenreListPage };
