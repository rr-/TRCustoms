import styles from "./index.module.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { DifficultiesCheckboxes } from "src/components/common/DifficultiesCheckboxes";
import { DurationsCheckboxes } from "src/components/common/DurationsCheckboxes";
import { EnginesCheckboxes } from "src/components/common/EnginesCheckboxes";
import { GenresCheckboxes } from "src/components/common/GenresCheckboxes";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { SidebarBox } from "src/components/common/SidebarBox";
import { TagsCheckboxes } from "src/components/common/TagsCheckboxes";
import { CheckboxFormField } from "src/components/formfields/CheckboxFormField";
import { DropDownFormField } from "src/components/formfields/DropDownFormField";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons";
import type { LevelSearchQuery } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

const sortOptions = [
  { label: "Most recent", value: "-created" },
  { label: "Least recent", value: "created" },
  { label: "Best rated", value: "-rating" },
  { label: "Worst rated", value: "rating" },
  { label: "Most downloaded", value: "-download_count" },
  { label: "Least downloaded", value: "download_count" },
  { label: "Biggest size", value: "-size" },
  { label: "Smallest size", value: "size" },
];

const convertSearchQueryToFormikValues = (
  searchQuery: LevelSearchQuery,
  defaultSearchQuery: LevelSearchQuery
) => {
  return {
    sort: searchQuery.sort || defaultSearchQuery.sort,
    search: searchQuery.search || "",
    tags: searchQuery.tags,
    genres: searchQuery.genres,
    engines: searchQuery.engines,
    difficulties: searchQuery.difficulties,
    durations: searchQuery.durations,
    isApproved: searchQuery.isApproved,
  };
};

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
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery, defaultSearchQuery)
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    (values: any) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        sort: values.sort,
        search: values.search,
        tags: values.tags,
        genres: values.genres,
        engines: values.engines,
        isApproved: values.isApproved,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleEnginesChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        engines: values,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleGenresChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        genres: values,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleTagsChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        tags: values,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleDurationsChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        durations: values,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleDifficultiesChange = useCallback(
    (values: number[]) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        difficulties: values,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleClear = useCallback(
    () => onSearchQueryChange(defaultSearchQuery),
    [onSearchQueryChange, defaultSearchQuery]
  );

  useEffect(
    () =>
      setFormikValues(
        convertSearchQueryToFormikValues(searchQuery, defaultSearchQuery)
      ),
    [searchQuery, defaultSearchQuery]
  );

  return (
    <SidebarBox>
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ submitForm, resetForm }) => (
          <Form className="ChildMarginClear">
            <SectionHeader className={styles.header}>
              Search filter
              <Link className={styles.resetButton} onClick={handleClear}>
                (reset)
              </Link>
            </SectionHeader>

            <PermissionGuard require={UserPermission.editLevels}>
              <div className={styles.section}>
                <CheckboxFormField
                  onChange={() => {
                    submitForm();
                  }}
                  label="Approved"
                  name="isApproved"
                />
              </div>
            </PermissionGuard>

            <div className={styles.section}>
              <DropDownFormField
                onChange={() => {
                  submitForm();
                }}
                label="Sort"
                name="sort"
                options={sortOptions}
              />
            </div>

            <div className={`${styles.section} ${styles.searchBar}`}>
              <TextFormField label="Search level/author" name="search" />
              <div className="FormField">
                <SubmitButton onClick={submitForm} icon={<IconSearch />} />
              </div>
            </div>

            <div className={styles.section}>
              <EnginesCheckboxes
                value={searchQuery.engines}
                onChange={handleEnginesChange}
              />
            </div>

            <div className={styles.section}>
              <GenresCheckboxes
                value={searchQuery.genres}
                onChange={handleGenresChange}
              />
            </div>

            <div className={styles.section}>
              <TagsCheckboxes
                value={searchQuery.tags}
                onChange={handleTagsChange}
              />
            </div>

            <div className={styles.section}>
              <DurationsCheckboxes
                value={searchQuery.durations}
                onChange={handleDurationsChange}
              />
            </div>

            <div className={styles.section}>
              <DifficultiesCheckboxes
                value={searchQuery.difficulties}
                onChange={handleDifficultiesChange}
              />
            </div>
          </Form>
        )}
      </Formik>
    </SidebarBox>
  );
};

export { LevelSearchSidebar };
