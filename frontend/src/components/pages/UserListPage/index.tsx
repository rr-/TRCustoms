import { useState } from "react";
import { PageGuard } from "src/components/common/PermissionGuard";
import { QueryPersister } from "src/components/common/QueryPersister";
import { deserializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { serializeGenericSearchQuery } from "src/components/common/QueryPersister";
import { UserList } from "src/components/common/UserList";
import { UserSearch } from "src/components/common/UserSearch";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { UserSearchQuery } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { getCurrentSearchParams } from "src/utils/misc";

const defaultSearchQuery: UserSearchQuery = {
  page: null,
  sort: "-date_joined",
  search: null,
};

const deserializeSearchQuery = (qp: {
  [key: string]: string;
}): UserSearchQuery => deserializeGenericSearchQuery(qp, defaultSearchQuery);

const serializeSearchQuery = (
  searchQuery: UserSearchQuery
): { [key: string]: any } =>
  serializeGenericSearchQuery(searchQuery, defaultSearchQuery);

const UserListPageView = () => {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>(
    deserializeSearchQuery(getCurrentSearchParams())
  );

  usePageMetadata(() => ({ ready: true, title: "Users" }), []);

  return (
    <PlainLayout>
      <QueryPersister
        serializeSearchQuery={serializeSearchQuery}
        deserializeSearchQuery={deserializeSearchQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <UserSearch
        defaultSearchQuery={defaultSearchQuery}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <UserList
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
    </PlainLayout>
  );
};

const UserListPage = () => {
  return (
    <PageGuard require={UserPermission.manageUsers}>
      <UserListPageView />
    </PageGuard>
  );
};

export { UserListPage };
