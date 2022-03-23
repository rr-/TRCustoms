import { Formik } from "formik";
import { Form } from "formik";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useContext } from "react";
import { PageGuard } from "src/components/PermissionGuard";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { SearchBar } from "src/components/SearchBar";
import { UsersTable } from "src/components/UsersTable";
import { TextFormField } from "src/components/formfields/TextFormField";
import { TitleContext } from "src/contexts/TitleContext";
import type { UserSearchQuery } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { getCurrentSearchParams } from "src/utils";

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

const UserListPageView = () => {
  const { setTitle } = useContext(TitleContext);
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );
  const [formikValues, setFormikValues] = useState<any>(
    convertSearchQueryToFormikValues(searchQuery)
  );

  useEffect(() => {
    setTitle("Users");
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
        search: values.search || null,
      });
    },
    [searchQuery, setSearchQuery]
  );

  const handleReset = useCallback(
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
        onSubmit={handleSubmit}
      >
        {({ resetForm }: { resetForm: any }) => (
          <Form id="UserListPage--container">
            <SearchBar id="UserListPage--search">
              <TextFormField label="Search" name="search" />

              <div className="FormField">
                <button type="submit">Search</button>
              </div>

              <div className="FormField">
                <button
                  onClick={handleReset.bind(null, resetForm)}
                  type="reset"
                >
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

const UserListPage = () => {
  return (
    <PageGuard require={UserPermission.listUsers}>
      <UserListPageView />
    </PageGuard>
  );
};

export { UserListPage };
