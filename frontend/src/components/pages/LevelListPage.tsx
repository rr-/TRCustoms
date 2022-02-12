import "./LevelListPage.css";
import { SearchIcon } from "@heroicons/react/outline";
import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useContext } from "react";
import { EnginesCheckboxes } from "src/components/EnginesCheckboxes";
import { GenresCheckboxes } from "src/components/GenresCheckboxes";
import { TagsCheckboxes } from "src/components/TagsCheckboxes";
import type { LevelSearchQuery } from "src/services/level.service";
import { UserPermission } from "src/services/user.service";
import { LevelsTable } from "src/shared/components/LevelsTable";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import { PushButton } from "src/shared/components/PushButton";
import { QueryPersister } from "src/shared/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { SectionHeader } from "src/shared/components/Section";
import { SidebarBox } from "src/shared/components/SidebarBox";
import { CheckboxFormField } from "src/shared/components/formfields/CheckboxFormField";
import { DropDownFormField } from "src/shared/components/formfields/DropDownFormField";
import { TextFormField } from "src/shared/components/formfields/TextFormField";
import { TitleContext } from "src/shared/contexts/TitleContext";
import { filterFalsyObjectValues } from "src/shared/utils";
import { getCurrentSearchParams } from "src/shared/utils";

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

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): LevelSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  tags: (qp.tags?.split(/,/g) || []).map((item) => +item),
  genres: (qp.genres?.split(/,/g) || []).map((item) => +item),
  engines: (qp.engines?.split(/,/g) || []).map((item) => +item),
  authors: [],
  isApproved: qp.approved === "1" ? true : qp.approved === "0" ? false : true,
});

const serializeSearchQuery = (
  searchQuery: LevelSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    tags: searchQuery.tags.join(","),
    genres: searchQuery.genres.join(","),
    engines: searchQuery.engines.join(","),
    approved:
      searchQuery.isApproved === true
        ? null
        : searchQuery.isApproved === false
        ? "0"
        : null,
  });

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

const LevelListPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<LevelSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(() => {
    setTitle("level search");
  }, [setTitle]);

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const handleClear = useCallback(() => setSearchQuery(defaultSearchQuery), [
    setSearchQuery,
  ]);

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setSearchQuery({
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
    [searchQuery, setSearchQuery]
  );

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

  return (
    <div id="LevelListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={handleSubmit}
      >
        {({ submitForm, resetForm }) => (
          <Form id="LevelListPage--container">
            <div id="LevelListPage--results">
              <LevelsTable
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </div>

            <SidebarBox id="LevelListPage--sidebar">
              <SectionHeader className="LevelListPage--sidebarHeader">
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
                <div className="LevelListPage--sidebarSection">
                  <CheckboxFormField
                    onChange={() => {
                      submitForm();
                    }}
                    label="Approved"
                    name="isApproved"
                  />
                </div>
              </PermissionGuard>

              <div className="LevelListPage--sidebarSection">
                <DropDownFormField
                  onChange={() => {
                    submitForm();
                  }}
                  label="Sort"
                  name="sort"
                  options={sortOptions}
                />
              </div>

              <div className="LevelListPage--sidebarSection LevelListPage--searchBar">
                <TextFormField label="Search level/author" name="search" />
                <div className="FormField">
                  <button type="submit">
                    <SearchIcon className="Icon" />
                  </button>
                </div>
              </div>

              <div className="LevelListPage--sidebarSection">
                <EnginesCheckboxes
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />
              </div>

              <div className="LevelListPage--sidebarSection">
                <GenresCheckboxes
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />
              </div>

              <div className="LevelListPage--sidebarSection">
                <TagsCheckboxes
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />
              </div>
            </SidebarBox>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { LevelListPage };
