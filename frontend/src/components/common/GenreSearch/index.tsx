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
import type { GenreSearchQuery } from "src/services/GenreService";

const convertSearchQueryToFormikValues = (searchQuery: GenreSearchQuery) => {
  return { search: searchQuery.search || "" };
};

interface GenreSearchProps {
  defaultSearchQuery: GenreSearchQuery;
  searchQuery: GenreSearchQuery;
  onSearchQueryChange: (searchQuery: GenreSearchQuery) => void;
}

const GenreSearch = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: GenreSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
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
      {({ submitForm }) => (
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

export { GenreSearch };
