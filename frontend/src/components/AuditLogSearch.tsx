import "./AuditLogSearch.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { Checkbox } from "src/components/Checkbox";
import { PushButton } from "src/components/PushButton";
import { SectionHeader } from "src/components/Section";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons/IconSearch";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";

interface StateSearch {
  title: string;
  search: string;
}

interface StateSearchSection {
  title: string;
  searchList: StateSearch[];
}

const StateSearches: StateSearchSection[] = [
  {
    title: "User States",
    searchList: [
      { title: "Created", search: "state:user_created" },
      { title: "Activated", search: "state:user_activated" },
      { title: "Rejected", search: "state:user_rejected" },
      { title: "Banned", search: "state:user_banned" },
    ],
  },
  {
    title: "Level States",
    searchList: [
      { title: "Created", search: "state:level_created" },
      { title: "Updated", search: "state:level_updated" },
      { title: "Approved", search: "state:level_approved" },
      { title: "Rejected", search: "state:level_rejected" },
    ],
  },
  {
    title: "Review States",
    searchList: [
      { title: "Posted", search: "state:levelreview_created" },
      { title: "Updated", search: "state:levelreview_updated" },
    ],
  },
  {
    title: "Tag States",
    searchList: [
      { title: "Created", search: "state:tag_created" },
      { title: "Deleted", search: "state:tag_deleted" },
      { title: "Merged", search: "state:tag_merged" },
    ],
  },
];

const defaultSearchQuery: AuditLogSearchQuery = {
  isActionRequired: undefined,
  page: null,
  sort: "-created",
};

const convertSearchQueryToFormikValues = (searchQuery: AuditLogSearchQuery) => {
  return {
    userSearch: searchQuery.userSearch || "",
    objectSearch: searchQuery.objectSearch || "",
  };
};

interface AuditLogSearchProps {
  searchQuery: AuditLogSearchQuery;
  onSearchQueryChange: (searchQuery: AuditLogSearchQuery) => void;
}

const AuditLogSearch = ({
  searchQuery,
  onSearchQueryChange,
}: AuditLogSearchProps) => {
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      onSearchQueryChange({
        ...searchQuery,
        page: null,
        userSearch: values.userSearch || null,
        objectSearch: values.objectSearch || null,
      });
    },
    [searchQuery, onSearchQueryChange]
  );

  const handleClear = useCallback(
    async (resetForm) => {
      onSearchQueryChange(defaultSearchQuery);
      resetForm();
    },
    [onSearchQueryChange]
  );

  const handleStateSearchCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    search: StateSearch
  ) => {
    const terms = searchQuery.search?.split(/ /) || [];
    onSearchQueryChange({
      ...searchQuery,
      search: event.target.checked
        ? [...terms, search.search].join(" ")
        : [...terms.filter((s) => s !== search.search)].join(" "),
    });
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formikValues}
      onSubmit={handleSubmit}
    >
      {({ submitForm, resetForm }) => (
        <Form className="AuditLogSearch ChildMarginClear">
          <SectionHeader className="AuditLogSearch--sidebarHeader">
            Search filter
            <PushButton
              isPlain={true}
              disableTimeout={true}
              onClick={() => handleClear(resetForm)}
            >
              (reset)
            </PushButton>
          </SectionHeader>

          <div className="AuditLogSearch--sidebarSection">
            <TextFormField label="Search user" name="userSearch" />
            <TextFormField label="Search object" name="objectSearch" />
            <div className="FormField">
              <SubmitButton onClick={submitForm} icon={<IconSearch />}>
                Search
              </SubmitButton>
            </div>
          </div>

          {StateSearches.map((section, sectionNum) => (
            <>
              <SectionHeader
                key={sectionNum}
                className="AuditLogSearch--sidebarHeader"
              >
                {section.title}
              </SectionHeader>
              <div className="AuditLogSearch--sidebarSection">
                {section.searchList.map((search, searchNum) => (
                  <div key={searchNum}>
                    <Checkbox
                      label={search.title}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleStateSearchCheckboxChange(event, search)
                      }
                      checked={
                        searchQuery.search?.includes(search.search) || false
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          ))}
        </Form>
      )}
    </Formik>
  );
};

export { defaultSearchQuery, AuditLogSearch };
