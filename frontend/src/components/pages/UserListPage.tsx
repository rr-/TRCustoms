import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import type { UserSearchQuery } from "src/services/user.service";
import { QueryPersister } from "src/shared/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/shared/components/QueryPersister";
import { SearchBar } from "src/shared/components/SearchBar";
import { UsersTable } from "src/shared/components/UsersTable";
import { TextFormField } from "src/shared/components/formfields/TextFormField";
import { getCurrentSearchParams } from "src/shared/utils";

const defaultSearchQuery: UserSearchQuery = {
  page: null,
  sort: "-date_joined",
  search: null,
};

const convertSearchQueryToFormikValues = (searchQuery: UserSearchQuery) => {
  return { search: searchQuery.search || "" };
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): UserSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: UserSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const UserListPage = () => {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(
    () => setFormikValues(convertSearchQueryToFormikValues(searchQuery)),
    [searchQuery]
  );

  const searchClick = useCallback(
    // push changes to query on Formik submit
    async (values: any) => {
      setSearchQuery({
        ...searchQuery,
        page: null,
        search: values.search || null,
      });
    },
    [searchQuery, setSearchQuery]
  );

  const clearClick = useCallback(
    async (resetForm) => {
      setSearchQuery(defaultSearchQuery);
      resetForm();
    },
    [setSearchQuery]
  );

  return (
    <div id="UserListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Formik
        enableReinitialize={true}
        initialValues={formikValues}
        onSubmit={searchClick}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="UserListPage--container">
            <SearchBar id="UserListPage--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button onClick={clearClick.bind(null, resetForm)} type="reset">
                  Reset
                </button>
              </div>
            </SearchBar>

            <div id="UserListPage--results">
              <UsersTable
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { UserListPage };
