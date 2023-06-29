import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { Button } from "src/components/common/Button";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridButtons } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons";
import type { TagSearchQuery } from "src/services/TagService";

const convertSearchQueryToFormikValues = (searchQuery: TagSearchQuery) => {
  return { search: searchQuery.search || "" };
};

interface TagSearchProps {
  defaultSearchQuery: TagSearchQuery;
  searchQuery: TagSearchQuery;
  onSearchQueryChange: (searchQuery: TagSearchQuery) => void;
}

const TagSearch = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: TagSearchProps) => {
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
          <FormGrid gridType={FormGridType.Row}>
            <FormGridFieldSet>
              <TextFormField label="Search" name="search" />
            </FormGridFieldSet>

            <FormGridButtons>
              <SubmitButton onClick={() => submitForm()} icon={<IconSearch />}>
                Search
              </SubmitButton>

              <Button disableTimeout={true} onClick={handleClear}>
                Reset
              </Button>
            </FormGridButtons>
          </FormGrid>
        </Form>
      )}
    </Formik>
  );
};

export { TagSearch };
