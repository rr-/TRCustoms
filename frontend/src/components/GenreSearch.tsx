import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { SearchBar } from "src/components/SearchBar";
import { TextFormField } from "src/components/formfields/TextFormField";
import type { GenreSearchQuery } from "src/services/GenreService";

const defaultSearchQuery: GenreSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const convertSearchQueryToFormikValues = (searchQuery: GenreSearchQuery) => {
  return { search: searchQuery.search || "" };
};

interface GenreSearchProps {
  searchQuery: GenreSearchQuery;
  onSearchQueryChange: (searchQuery: GenreSearchQuery) => void;
}

const GenreSearch = ({
  searchQuery,
  onSearchQueryChange,
}: GenreSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        search: values.search || null,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleClear = useCallback(
    () => onSearchQueryChange(defaultSearchQuery),
    [onSearchQueryChange]
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formikValues}
      onSubmit={handleSubmit}
    >
      {() => (
        <Form className="GenreSearch">
          <SearchBar>
            <TextFormField label="Search" name="search" />

            <div className="FormField">
              <button type="submit">Search</button>
            </div>

            <div className="FormField">
              <button onClick={handleClear} type="reset">
                Reset
              </button>
            </div>
          </SearchBar>
        </Form>
      )}
    </Formik>
  );
};

export { defaultSearchQuery, GenreSearch };
