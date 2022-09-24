import "./index.css";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { UserLink } from "src/components/links/UserLink";
import type { UserListing } from "src/services/UserService";
import type { UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { formatDate } from "src/utils/string";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils/string";

interface UserListProps {
  searchQuery: UserSearchQuery;
  onSearchQueryChange?: ((searchQuery: UserSearchQuery) => void) | undefined;
}

const UserList = ({ searchQuery, onSearchQueryChange }: UserListProps) => {
  const columns: DataTableColumn<UserListing>[] = [
    {
      name: "username",
      sortKey: "username",
      label: "User name",
      itemElement: ({ item }) => <UserLink user={item} />,
    },
    {
      name: "firstName",
      sortKey: "first_name",
      label: "First name",
      itemElement: ({ item }) => item.first_name || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "lastName",
      sortKey: "last_name",
      label: "Last name",
      itemElement: ({ item }) => item.last_name || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "created",
      sortKey: "date_joined",
      label: "Created",
      itemElement: ({ item }) => formatDate(item.date_joined),
    },
    {
      name: "lastLogin",
      sortKey: "last_login",
      label: "Last login",
      itemElement: ({ item }) => formatDate(item.last_login),
    },
    {
      name: "authoredLevelCount",
      sortKey: "authored_level_count",
      label: "Authored levels",
      itemElement: ({ item }) => `${item.authored_level_count}`,
    },
    {
      name: "reviewedLevelCount",
      sortKey: "reviewed_level_count",
      label: "Reviewed levels",
      itemElement: ({ item }) => `${item.reviewed_level_count}`,
    },
  ];

  const itemKey = (user: UserListing) => `${user.id}`;

  return (
    <DataTable
      className="UserList"
      queryName="users"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={UserService.searchUsers}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { UserList };
