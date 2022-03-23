import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { SearchBar } from "src/components/SearchBar";
import { TextFormField } from "src/components/formfields/TextFormField";
import type { TagSearchQuery } from "src/services/TagService";

const defaultSearchQuery: TagSearchQuery = {
  page: null,
  sort: "name",
  search: null,
};

const convertSearchQueryToFormikValues = (searchQuery: TagSearchQuery) => {
  return { search: searchQuery.search || "" };
};

interface TagSearchProps {
  searchQuery: TagSearchQuery;
  onSearchQueryChange: (searchQuery: TagSearchQuery) => void;
}

const TagSearch = ({ searchQuery, onSearchQueryChange }: TagSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
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

  const handleReset = useCallback(
    async (resetForm) => {
      onSearchQueryChange(defaultSearchQuery);
      resetForm();
    },
    [onSearchQueryChange]
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formikValues}
      onSubmit={handleSubmit}
    >
      {({ resetForm }: { resetForm: any }) => (
        <Form className="TagListPage--container">
          <SearchBar>
            <TextFormField label="Search" name="search" />

            <div className="FormField">
              <button type="submit">Search</button>
            </div>

            <div className="FormField">
              <button onClick={handleReset.bind(null, resetForm)} type="reset">
                Reset
              </button>
            </div>
          </SearchBar>
        </Form>
      )}
    </Formik>
  );
};

export { defaultSearchQuery, TagSearch };
