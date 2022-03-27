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
import { IconSearch } from "src/components/icons";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";

interface StateSearchSectionItem {
  title: string;
  searchChanges: string;
}

interface StateSearchSection {
  title: string;
  searchModel: string;
  searchList: StateSearchSectionItem[];
}

const splitTerms = (searchQuery: string | null | undefined): string[] => {
  return (searchQuery?.split(/ /) || []).filter((term) => term);
};

const addSearchTerm = (
  searchQuery: string | null | undefined,
  model: string,
  changes: string
) => {
  const terms = splitTerms(searchQuery);
  const newTerms = [];
  let found = false;
  for (let term of terms) {
    const [otherModel, changesStr] = term.split(/:/);
    const otherChanges = changesStr.split(/,/).filter((c) => c);
    if (model === otherModel) {
      if (!otherChanges.includes(changes)) {
        otherChanges.push(changes);
        found = true;
      }
    }
    newTerms.push(`${otherModel}:${otherChanges.join(",")}`);
  }
  if (!found) {
    newTerms.push(`${model}:${changes}`);
  }
  return newTerms.join(" ");
};

const deleteSearchTerm = (
  searchQuery: string | null | undefined,
  model: string,
  changes: string
) => {
  const terms = splitTerms(searchQuery);
  const newTerms = [];
  for (let term of terms) {
    const [otherModel, changesStr] = term.split(/:/);
    let otherChanges = changesStr.split(/,/).filter((c) => c);
    if (model === otherModel) {
      otherChanges = otherChanges.filter((c) => c !== changes);
    }
    if (otherChanges.length) {
      newTerms.push(`${otherModel}:${otherChanges.join(",")}`);
    }
  }
  return newTerms.join(" ");
};

const isSearchTermPresent = (
  searchQuery: string | null | undefined,
  model: string,
  changes: string
) => {
  const terms = splitTerms(searchQuery);
  for (const term of terms) {
    const [otherModel, changesStr] = term.split(/:/);
    const otherChanges = changesStr.split(/,/);
    if (model === otherModel && otherChanges.includes(changes)) {
      return true;
    }
  }
  return false;
};

const StateSearches: StateSearchSection[] = [
  {
    title: "User States",
    searchModel: "user",
    searchList: [
      { title: "Created", searchChanges: "created" },
      { title: "Activated", searchChanges: "activated" },
      { title: "Rejected", searchChanges: "rejected" },
      { title: "Banned", searchChanges: "banned" },
    ],
  },
  {
    title: "Level States",
    searchModel: "level",
    searchList: [
      { title: "Created", searchChanges: "created" },
      { title: "Updated", searchChanges: "updated" },
      { title: "Approved", searchChanges: "approved" },
      { title: "Rejected", searchChanges: "rejected" },
    ],
  },
  {
    title: "Review States",
    searchModel: "levelreview",
    searchList: [
      { title: "Posted", searchChanges: "created" },
      { title: "Updated", searchChanges: "updated" },
    ],
  },
  {
    title: "Tag States",
    searchModel: "tag",
    searchList: [
      { title: "Created", searchChanges: "created" },
      { title: "Deleted", searchChanges: "deleted" },
      { title: "Merged", searchChanges: "merged" },
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
    section: StateSearchSection,
    sectionItem: StateSearchSectionItem
  ) => {
    const newSearch = event.target.checked
      ? addSearchTerm(
          searchQuery.search,
          section.searchModel,
          sectionItem.searchChanges
        )
      : deleteSearchTerm(
          searchQuery.search,
          section.searchModel,
          sectionItem.searchChanges
        );
    onSearchQueryChange({ ...searchQuery, search: newSearch });
  };

  const isStateSearchCheckboxChecked = (
    section: StateSearchSection,
    sectionItem: StateSearchSectionItem
  ): boolean => {
    return isSearchTermPresent(
      searchQuery.search,
      section.searchModel,
      sectionItem.searchChanges
    );
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
                {section.searchList.map((sectionItem, searchNum) => (
                  <div key={searchNum}>
                    <Checkbox
                      label={sectionItem.title}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleStateSearchCheckboxChange(
                          event,
                          section,
                          sectionItem
                        )
                      }
                      checked={isStateSearchCheckboxChecked(
                        section,
                        sectionItem
                      )}
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
