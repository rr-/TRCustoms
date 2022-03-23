import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { PushButton } from "src/components/PushButton";
import { SearchBar } from "src/components/SearchBar";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons/IconSearch";
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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formikValues}
      onSubmit={handleSubmit}
    >
      {({ submitForm, resetForm }) => (
        <Form className="TagListPage--container">
          <SearchBar>
            <TextFormField label="Search" name="search" />

            <div className="FormField">
              <SubmitButton onClick={() => submitForm()} icon={<IconSearch />}>
                Search
              </SubmitButton>
            </div>

            <div className="FormField">
              <PushButton disableTimeout={true} onClick={handleClear}>
                Reset
              </PushButton>
            </div>
          </SearchBar>
        </Form>
      )}
    </Formik>
  );
};

export { defaultSearchQuery, TagSearch };
