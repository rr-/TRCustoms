import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { PushButton } from "src/components/PushButton";
import { SearchBar } from "src/components/SearchBar";
import { CheckboxFormField } from "src/components/formfields/CheckboxFormField";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons";
import type { UserSearchQuery } from "src/services/UserService";

const convertSearchQueryToFormikValues = (searchQuery: UserSearchQuery) => {
  return {
    search: searchQuery.search || "",
    hideInactiveReviewers: searchQuery.hideInactiveReviewers,
  };
};

interface UserSearchProps {
  defaultSearchQuery: UserSearchQuery;
  searchQuery: UserSearchQuery;
  onSearchQueryChange: (searchQuery: UserSearchQuery) => void;
  showInactiveReviewersCheckbox?: boolean | undefined;
}

const UserSearch = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
  showInactiveReviewersCheckbox,
}: UserSearchProps) => {
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
        hideInactiveReviewers: values.hideInactiveReviewers,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleClear = useCallback(
    () => onSearchQueryChange(defaultSearchQuery),
    [onSearchQueryChange, defaultSearchQuery]
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formikValues}
      onSubmit={handleSubmit}
    >
      {({ submitForm, resetForm }) => (
        <Form>
          <SearchBar>
            <TextFormField label="Search" name="search" />

            {showInactiveReviewersCheckbox && (
              <CheckboxFormField
                onChange={() => {
                  submitForm();
                }}
                label="Hide inactive"
                name="hideInactiveReviewers"
              />
            )}

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

export { UserSearch };
