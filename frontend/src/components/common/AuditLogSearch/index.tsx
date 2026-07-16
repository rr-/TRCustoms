import styles from "./index.module.css";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "src/components/common/Checkbox";
import { Collapsible } from "src/components/common/Collapsible";
import { Link } from "src/components/common/Link";
import { SectionHeader } from "src/components/common/Section";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { CheckboxField } from "src/components/forms/CheckboxField";
import { Form } from "src/components/forms/Form";
import { TextField } from "src/components/forms/TextField";
import { IconSearch } from "src/components/icons";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";

interface StateSearchSectionItem {
  title: string;
  searchState: string;
}

interface StateSearchSection {
  title: string;
  storageKey: string;
  searchModel: string;
  searchList: StateSearchSectionItem[];
}

const splitTerms = (searchQuery: string | null | undefined): string[] => {
  return (searchQuery?.split(/ /) || []).filter((term) => term);
};

const addSearchTerm = (
  searchQuery: string | null | undefined,
  model: string,
  changes: string,
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
  changes: string,
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
  changes: string,
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
    storageKey: `auditLogUserStatus`,
    searchModel: "user",
    searchList: [
      { title: "Created", searchState: "created" },
      { title: "Updated", searchState: "updated" },
      { title: "Activated", searchState: "activated" },
      { title: "Rejected", searchState: "rejected" },
      { title: "Banned", searchState: "banned" },
      { title: "Confirmed email", searchState: "confirmed_email" },
    ],
  },
  {
    title: "Level States",
    storageKey: `auditLogLevelStatus`,
    searchModel: "level",
    searchList: [
      { title: "Created", searchState: "created" },
      { title: "Updated", searchState: "updated" },
      { title: "Approved", searchState: "approved" },
      { title: "Rejected", searchState: "rejected" },
      { title: "Deleted", searchState: "deleted" },
    ],
  },
  {
    title: "Rating States",
    storageKey: `auditLogRatingStatus`,
    searchModel: "rating",
    searchList: [
      { title: "Posted", searchState: "created" },
      { title: "Updated", searchState: "updated" },
      { title: "Deleted", searchState: "deleted" },
    ],
  },
  {
    title: "Review States",
    storageKey: `auditLogReviewStatus`,
    searchModel: "review",
    searchList: [
      { title: "Posted", searchState: "created" },
      { title: "Updated", searchState: "updated" },
      { title: "Hidden", searchState: "hidden" },
      { title: "Deleted", searchState: "deleted" },
    ],
  },
  {
    title: "Tag States",
    storageKey: `auditLogTagStatus`,
    searchModel: "tag",
    searchList: [
      { title: "Created", searchState: "created" },
      { title: "Deleted", searchState: "deleted" },
      { title: "Merged", searchState: "merged" },
    ],
  },
  {
    title: "Walkthrough States",
    storageKey: `auditLogWalkthroughStatus`,
    searchModel: "walkthrough",
    searchList: [
      { title: "Created", searchState: "created" },
      { title: "Published", searchState: "published" },
      { title: "Updated", searchState: "updated" },
      { title: "Approved", searchState: "approved" },
      { title: "Rejected", searchState: "rejected" },
      { title: "Deleted", searchState: "deleted" },
    ],
  },
];

const toFormValues = (searchQuery: AuditLogSearchQuery) => ({
  userSearch: searchQuery.userSearch || "",
  objectSearch: searchQuery.objectSearch || "",
  isActionRequired: searchQuery.isActionRequired,
});

interface AuditLogSearchProps {
  defaultSearchQuery: AuditLogSearchQuery;
  searchQuery: AuditLogSearchQuery;
  onSearchQueryChange: (searchQuery: AuditLogSearchQuery) => void;
}

const AuditLogSearch = ({
  defaultSearchQuery,
  searchQuery,
  onSearchQueryChange,
}: AuditLogSearchProps) => {
  const form = useForm({ defaultValues: toFormValues(searchQuery) });

  // Keep the form in sync when the query changes externally (URL, reset).
  const { reset } = form;
  useEffect(() => reset(toFormValues(searchQuery)), [searchQuery, reset]);

  const submit = form.handleSubmit((values) => {
    onSearchQueryChange({
      ...searchQuery,
      page: null,
      userSearch: values.userSearch || undefined,
      objectSearch: values.objectSearch || undefined,
      isActionRequired: values.isActionRequired,
    });
  });

  // The state-search checkboxes are not form fields; they edit the query's
  // free-text search string directly.
  const handleStateSearchCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    section: StateSearchSection,
    sectionItem: StateSearchSectionItem,
  ) => {
    const newSearch = event.target.checked
      ? addSearchTerm(
          searchQuery.search,
          section.searchModel,
          sectionItem.searchState,
        )
      : deleteSearchTerm(
          searchQuery.search,
          section.searchModel,
          sectionItem.searchState,
        );
    onSearchQueryChange({ ...searchQuery, search: newSearch });
  };

  const isStateSearchCheckboxChecked = (
    section: StateSearchSection,
    sectionItem: StateSearchSectionItem,
  ): boolean => {
    return isSearchTermPresent(
      searchQuery.search,
      section.searchModel,
      sectionItem.searchState,
    );
  };

  return (
    <Form form={form} onSubmit={submit} className="ChildMarginClear">
      <SectionHeader>
        <span className={styles.header}>
          Search filter
          <Link
            className={styles.resetButton}
            onClick={() => onSearchQueryChange(defaultSearchQuery)}
          >
            (reset)
          </Link>
        </span>
      </SectionHeader>

      <div className={styles.form}>
        <CheckboxField
          onChange={() => submit()}
          label="Action required"
          name="isActionRequired"
        />

        <TextField label="Search user" name="userSearch" />
        <TextField label="Search object" name="objectSearch" />
        <div className={styles.submitStrip}>
          <SubmitButton icon={<IconSearch />}>Search</SubmitButton>
        </div>
      </div>

      {StateSearches.map((section, sectionNum) => (
        <div className={styles.section} key={sectionNum}>
          <Collapsible
            key={section.storageKey}
            storageKey={section.storageKey}
            title={section.title}
          >
            {section.searchList.map((sectionItem, searchNum) => (
              <Checkbox
                key={searchNum}
                label={sectionItem.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleStateSearchCheckboxChange(event, section, sectionItem)
                }
                checked={isStateSearchCheckboxChecked(section, sectionItem)}
              />
            ))}
          </Collapsible>
        </div>
      ))}
    </Form>
  );
};

export { AuditLogSearch };
