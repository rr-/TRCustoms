import "./LevelSearchSidebar.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { EnginesCheckboxes } from "src/components/EnginesCheckboxes";
import { GenresCheckboxes } from "src/components/GenresCheckboxes";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { TagsCheckboxes } from "src/components/TagsCheckboxes";
import { CheckboxFormField } from "src/components/formfields/CheckboxFormField";
import { DropDownFormField } from "src/components/formfields/DropDownFormField";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons";
import type { LevelSearchQuery } from "src/services/LevelService";
import { UserPermission } from "src/services/UserService";

const sortOptions = [
  { label: "Alphabetically", value: "name" },
  { label: "By engine", value: "engine" },
  { label: "Newest first", value: "-created" },
  { label: "Oldest first", value: "created" },
  { label: "Best rated", value: "-rating" },
  { label: "Worst rated", value: "rating" },
  { label: "Most downloaded", value: "-download_count" },
  { label: "Least downloaded", value: "download_count" },
  { label: "Biggest size", value: "-size" },
  { label: "Smallest size", value: "size" },
];

const defaultSearchQuery: LevelSearchQuery = {
  page: null,
  sort: "-created",
  search: null,
  tags: [],
  genres: [],
  engines: [],
  authors: [],
  isApproved: true,
};

const convertSearchQueryToFormikValues = (searchQuery: LevelSearchQuery) => {
  return {
    sort: searchQuery.sort || defaultSearchQuery.sort,
    search: searchQuery.search || "",
    tags: searchQuery.tags,
    genres: searchQuery.genres,
    engines: searchQuery.engines,
    isApproved: searchQuery.isApproved,
  };
};

interface LevelSearchProps {
  searchQuery: LevelSearchQuery;
  onSearchQueryChange: (searchQuery: LevelSearchQuery) => void;
}

const LevelSearchSidebar = ({
  searchQuery,
  onSearchQueryChange,
}: LevelSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
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

  const handleClear = useCallback(
    () => onSearchQueryChange(defaultSearchQuery),
    [onSearchQueryChange]
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  return (
    <SidebarBox>
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ submitForm, resetForm }) => (
          <Form className="LevelSearchSidebar ChildMarginClear">
            <SectionHeader className="LevelSearchSidebar--sidebarHeader">
              Search filter
              <PushButton
                isPlain={true}
                disableTimeout={true}
                onClick={handleClear}
              >
                (reset)
              </PushButton>
            </SectionHeader>

            <PermissionGuard require={UserPermission.editLevels}>
              <div className="LevelSearchSidebar--sidebarSection">
                <CheckboxFormField
                  onChange={() => {
                    submitForm();
                  }}
                  label="Approved"
                  name="isApproved"
                />
              </div>
            </PermissionGuard>

            <div className="LevelSearchSidebar--sidebarSection">
              <DropDownFormField
                onChange={() => {
                  submitForm();
                }}
                label="Sort"
                name="sort"
                options={sortOptions}
              />
            </div>

            <div className="LevelSearchSidebar--sidebarSection LevelSearchSidebar--searchBar">
              <TextFormField label="Search level/author" name="search" />
              <div className="FormField">
                <SubmitButton
                  onClick={submitForm}
                  icon={<IconSearch />}
                ></SubmitButton>
              </div>
            </div>

            <div className="LevelSearchSidebar--sidebarSection">
              <EnginesCheckboxes
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
              />
            </div>

            <div className="LevelSearchSidebar--sidebarSection">
              <GenresCheckboxes
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
              />
            </div>

            <div className="LevelSearchSidebar--sidebarSection">
              <TagsCheckboxes
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
              />
            </div>
          </Form>
        )}
      </Formik>
    </SidebarBox>
  );
};

export { defaultSearchQuery, LevelSearchSidebar };