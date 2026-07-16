import styles from "./index.module.css";
import { useCallback } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AdvancedFilters } from "src/components/common/LevelSearchSidebar/AdvancedFilters";
import { sortOptions } from "src/components/common/LevelSearchSidebar/options";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { Radioboxes } from "src/components/common/Radioboxes";
import { SidebarBoxHeader } from "src/components/common/SidebarBox";
import { SidebarBox } from "src/components/common/SidebarBox";
import { Form } from "src/components/forms/Form";
import { SubmitButton } from "src/components/forms/SubmitButton";
import { DropDownField } from "src/components/forms/fields/DropDownField";
import { TextField } from "src/components/forms/fields/TextField";
import { IconSearch } from "src/components/icons";
import type { LevelSearchQuery } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

const toFormValues = (
  searchQuery: LevelSearchQuery,
  defaultSearchQuery: LevelSearchQuery,
) => ({
  sort: searchQuery.sort || defaultSearchQuery.sort || "",
  search: searchQuery.search || "",
});

interface LevelSearchProps {
  defaultSearchQuery: LevelSearchQuery;
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => void;
}

const LevelSearchSidebar = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: LevelSearchProps) => {
  const form = useForm({
    defaultValues: toFormValues(searchQuery, defaultSearchQuery),
  });

  // Keep the form in sync when the query changes externally (URL, reset, or the
  // standalone filter widgets below).
  const { reset } = form;
  useEffect(
    () => reset(toFormValues(searchQuery, defaultSearchQuery)),
    [searchQuery, defaultSearchQuery, reset],
  );

  // Only sort and search are form fields; every other filter lives in
  // AdvancedFilters and edits the query directly.
  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      sort: values.sort,
      search: values.search,
    });
  });

  const handleIsApprovedChange = useCallback(
    (value: boolean | null) => {
      onSearchQueryChange({ ...searchQuery, isApproved: value });
    },
    [searchQuery, onSearchQueryChange],
  );

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

        <PermissionGuard require={UserPermission.viewPendingLevels}>
          <div className={styles.section}>
            <Radioboxes
              header="Approval status"
              options={[
                { id: null, name: "Show all" },
                { id: true, name: "Approved only" },
                { id: false, name: "Unapproved only" },
              ]}
              value={searchQuery.isApproved}
              onChange={handleIsApprovedChange}
              getOptionId={(option) => option.id}
              getOptionName={(option) => option.name}
            />
          </div>
        </PermissionGuard>

        <div className={styles.section}>
          <DropDownField
            onChange={() => submit()}
            label="Sort"
            name="sort"
            options={sortOptions}
          />
        </div>

        <div className={`${styles.section} ${styles.searchBar}`}>
          <TextField label="Search" name="search" />
          <div className="FormField">
            <SubmitButton icon={<IconSearch />} />
          </div>
        </div>

        <AdvancedFilters
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />
      </Form>
    </SidebarBox>
  );
};

export { LevelSearchSidebar };
