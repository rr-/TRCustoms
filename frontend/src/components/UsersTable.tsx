import "./UsersTable.css";
import type { DataTableColumn } from "src/components/DataTable";
import { DataTable } from "src/components/DataTable";
import { UserLink } from "src/components/links/UserLink";
import type { UserListing } from "src/services/UserService";
import type { UserSearchQuery } from "src/services/UserService";
import { UserService } from "src/services/UserService";
import { formatDate } from "src/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/utils";

interface UsersTableProps {
  searchQuery: UserSearchQuery;
  onSearchQueryChange?: ((searchQuery: UserSearchQuery) => void) | undefined;
}

const UsersTable = ({ searchQuery, onSearchQueryChange }: UsersTableProps) => {
  const columns: DataTableColumn<UserListing>[] = [
    {
      name: "username",
      sortKey: "username",
      label: "User name",
      itemElement: ({ item }) => <UserLink user={item} />,
    },
    {
      name: "first-name",
      sortKey: "first_name",
      label: "First name",
      itemElement: ({ item }) =>
        (item.is_active && item.first_name) || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "last-name",
      sortKey: "last_name",
      label: "Last name",
      itemElement: ({ item }) =>
        (item.is_active && item.last_name) || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "created",
      sortKey: "date_joined",
      label: "Created",
      itemElement: ({ item }) => formatDate(item.date_joined),
    },
    {
      name: "last-login",
      sortKey: "last_login",
      label: "Last login",
      itemElement: ({ item }) => formatDate(item.last_login),
    },
    {
      name: "authored-level-count",
      sortKey: "authored_level_count",
      label: "Authored levels",
      itemElement: ({ item }) => `${item.authored_level_count}`,
    },
    {
      name: "reviewed-level-count",
      sortKey: "reviewed_level_count",
      label: "Reviewed levels",
      itemElement: ({ item }) => `${item.reviewed_level_count}`,
    },
  ];

  const itemKey = (user: UserListing) => `${user.id}`;

  return (
    <DataTable
      className="UsersTable"
      queryName="users"
      columns={columns}
      itemKey={itemKey}
      searchQuery={searchQuery}
      searchFunc={UserService.searchUsers}
      onSearchQueryChange={onSearchQueryChange}
    />
  );
};

export { UsersTable };