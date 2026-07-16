import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/common/Button";
import { FormGrid } from "src/components/common/FormGrid";
import { FormGridFieldSet } from "src/components/common/FormGrid";
import { FormGridType } from "src/components/common/FormGrid";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { CheckboxField } from "src/components/forms/CheckboxField";
import { Form } from "src/components/forms/Form";
import { FormButtons } from "src/components/forms/FormButtons";
import { TextField } from "src/components/forms/TextField";
import { IconSearch } from "src/components/icons";
import type { UserSearchQuery } from "src/services/UserService";

const toFormValues = (searchQuery: UserSearchQuery) => ({
  search: searchQuery.search || "",
  hideInactiveReviewers: searchQuery.hideInactiveReviewers,
});

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
  const form = useForm({ defaultValues: toFormValues(searchQuery) });

  // Keep the form in sync when the query changes externally (URL, reset).
  const { reset } = form;
  useEffect(() => reset(toFormValues(searchQuery)), [searchQuery, reset]);

  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      search: values.search || null,
      hideInactiveReviewers: values.hideInactiveReviewers,
    });
  });

  return (
    <Form form={form} onSubmit={submit}>
      <FormGrid gridType={FormGridType.Row}>
        <FormGridFieldSet>
          <TextField label="Search" name="search" />

          {showInactiveReviewersCheckbox && (
            <CheckboxField
              onChange={() => submit()}
              label="Hide inactive"
              name="hideInactiveReviewers"
            />
          )}
        </FormGridFieldSet>

        <FormButtons>
          <SubmitButton icon={<IconSearch />}>Search</SubmitButton>

          <Button
            disableTimeout={true}
            onClick={() => onSearchQueryChange(defaultSearchQuery)}
          >
            Reset
          </Button>
        </FormButtons>
      </FormGrid>
    </Form>
  );
};

export { UserSearch };
