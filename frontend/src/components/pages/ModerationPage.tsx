import "./ModerationPage.css";
import { Formik } from "formik";
import { Form } from "formik";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { AuditLogTable } from "src/components/AuditLogTable";
import { Checkbox } from "src/components/Checkbox";
import { InfoMessage } from "src/components/InfoMessage";
import { InfoMessageType } from "src/components/InfoMessage";
import { PushButton } from "src/components/PushButton";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { SubmitButton } from "src/components/formfields/SubmitButton";
import { TextFormField } from "src/components/formfields/TextFormField";
import { IconSearch } from "src/components/icons/IconSearch";
import { TitleContext } from "src/contexts/TitleContext";
import type { AuditLogSearchQuery } from "src/services/AuditLogService";
import { filterFalsyObjectValues } from "src/utils";
import { getCurrentSearchParams } from "src/utils";

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

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): AuditLogSearchQuery => ({
  ...deserializeGenericSearchQuery(qp, defaultSearchQuery),
  userSearch: qp.user,
  objectSearch: qp.obj,
});

const serializeSearchQuery = (
  searchQuery: AuditLogSearchQuery
): { [key: string]: any } =>
  filterFalsyObjectValues({
    ...serializeGenericSearchQuery(searchQuery, defaultSearchQuery),
    user: searchQuery.userSearch,
    obj: searchQuery.objectSearch,
  });
const convertSearchQueryToFormikValues = (searchQuery: AuditLogSearchQuery) => {
  return {
    userSearch: searchQuery.userSearch || "",
    objectSearch: searchQuery.objectSearch || "",
  };
};

const ModerationPage = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<AuditLogSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(() => {
    setTitle("Moderate");
  }, [setTitle]);

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const handleSubmit = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setSearchQuery({
        ...searchQuery,
        page: null,
        userSearch: values.userSearch || null,
        objectSearch: values.objectSearch || null,
      });
    },
    [searchQuery, setSearchQuery]
  );

  const handleClear = useCallback(
    async (resetForm) => {
      setSearchQuery(defaultSearchQuery);
      resetForm();
    },
    [setSearchQuery]
  );

  const handleStateSearchCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    search: StateSearch
  ) => {
    const terms = searchQuery.search?.split(/ /) || [];
    setSearchQuery({
      ...searchQuery,
      search: event.target.checked
        ? [...terms, search.search].join(" ")
        : [...terms.filter((s) => s !== search.search)].join(" "),
    });
  };

  return (
    <div className="ModerationPage">
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
          <Form>
            <div className="ModerationPage--container">
              <div className="ModerationPage--disclaimer">
                <InfoMessage type={InfoMessageType.Info}>
                  The log contains recent changes made by all users. All these
                  changes are already live.
                  <br />
                  New levels and users can be approved on their individual
                  pages.
                </InfoMessage>
              </div>

              <div className="ModerationPage--sidebar">
                <SidebarBox>
                  <SectionHeader className="ModerationPage--sidebarHeader">
                    Search filter
                    <PushButton
                      isPlain={true}
                      disableTimeout={true}
                      onClick={() => handleClear(resetForm)}
                    >
                      (reset)
                    </PushButton>
                  </SectionHeader>

                  <div className="ModerationPage--sidebarSection">
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
                        className="ModerationPage--sidebarHeader"
                      >
                        {section.title}
                      </SectionHeader>
                      <div className="ModerationPage--sidebarSection">
                        {section.searchList.map((search, searchNum) => (
                          <div key={searchNum}>
                            <Checkbox
                              label={search.title}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleStateSearchCheckboxChange(event, search)
                              }
                              checked={
                                searchQuery.search?.includes(search.search) ||
                                false
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ))}
                </SidebarBox>
              </div>

              <div className="ModerationPage--results">
                <SectionHeader>Recent actions</SectionHeader>
                <AuditLogTable
                  showObjects={true}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { ModerationPage };
