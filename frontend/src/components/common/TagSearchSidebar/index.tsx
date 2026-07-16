import { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "src/components/common/LevelSearchSidebar/index.module.css";
import { Link } from "src/components/common/Link";
import { SidebarBox } from "src/components/common/SidebarBox";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { Form } from "src/components/forms/Form";
import { TextField } from "src/components/forms/TextField";
import { IconSearch } from "src/components/icons";
import type { TagSearchQuery } from "src/services/TagService";

const toFormValues = (searchQuery: TagSearchQuery) => ({
  search: searchQuery.search || "",
});

interface TagSearchProps {
  defaultSearchQuery: TagSearchQuery;
  searchQuery: TagSearchQuery;
  onSearchQueryChange: (searchQuery: TagSearchQuery) => void;
}

const TagSearchSidebar = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: TagSearchProps) => {
  const form = useForm({ defaultValues: toFormValues(searchQuery) });

  // Keep the form in sync when the query changes externally (URL, reset).
  const { reset } = form;
  useEffect(() => reset(toFormValues(searchQuery)), [searchQuery, reset]);

  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      search: values.search || null,
    });
  });

  return (
    <SidebarBox>
      <Form
        form={form}
        onSubmit={submit}
        className={`${styles.wrapper} ChildMarginClear`}
      >
        <SidebarBoxHeader alignToTabSwitch={true}>
          <span className={styles.header}>
            Search filter
            <Link
              className={styles.resetButton}
              onClick={() => onSearchQueryChange(defaultSearchQuery)}
            >
              (reset)
            </Link>
          </span>
        </SidebarBoxHeader>

        <div className={`${styles.section} ${styles.searchBar}`}>
          <TextField label="Tag name" name="search" />
          <div className="FormField">
            <SubmitButton icon={<IconSearch />} />
          </div>
        </div>
      </Form>
    </SidebarBox>
  );
};

export { TagSearchSidebar };
