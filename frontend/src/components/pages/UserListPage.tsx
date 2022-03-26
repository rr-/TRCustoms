import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { PageGuard } from "src/components/PermissionGuard";
import { QueryPersister } from "src/components/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/QueryPersister";
import { UserSearch } from "src/components/UserSearch";
import { defaultSearchQuery } from "src/components/UserSearch";
import { UsersTable } from "src/components/UsersTable";
import { TitleContext } from "src/contexts/TitleContext";
import type { UserSearchQuery } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { getCurrentSearchParams } from "src/utils";

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

  useEffect(() => {
    setTitle("Users");
  }, [setTitle]);

  return (
    <div className="UserListPage">
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <UserSearch
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <UsersTable
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </div>
  );
};

const UserListPage = () => {
  return (
    <PageGuard require={UserPermission.editUsers}>
      <UserListPageView />
    </PageGuard>
  );
};

export { UserListPage };
