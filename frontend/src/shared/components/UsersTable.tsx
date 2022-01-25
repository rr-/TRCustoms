import "./UsersTable.css";
import type { UserListing } from "src/services/user.service";
import type { UserSearchQuery } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { UserLink } from "src/shared/components/links/UserLink";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface UsersTableProps {
  searchQuery: UserSearchQuery;
  onSearchQueryChange?: (searchQuery: UserSearchQuery) => any | null;
}

const UsersTable = ({ searchQuery, onSearchQueryChange }: UsersTableProps) => {
  const columns: DataTableColumn<UserListing>[] = [
    {
      name: "username",
      sortKey: "username",
      label: "User name",
      itemElement: (user) => <UserLink user={user} />,
    },
    {
      name: "first-name",
      sortKey: "first_name",
      label: "First name",
      itemElement: (user) =>
        (user.is_active && user.first_name) || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "last-name",
      sortKey: "last_name",
      label: "Last name",
      itemElement: (user) =>
        (user.is_active && user.last_name) || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "created",
      sortKey: "date_joined",
      label: "Created",
      itemElement: (user) => formatDate(user.date_joined),
    },
    {
      name: "last-login",
      sortKey: "last_login",
      label: "Last login",
      itemElement: (user) => formatDate(user.last_login),
    },
    {
      name: "authored-level-count",
      sortKey: "authored_level_count",
      label: "Authored levels",
      itemElement: (user) => `${user.authored_level_count}`,
    },
    {
      name: "reviewed-level-count",
      sortKey: "reviewed_level_count",
      label: "Reviewed levels",
      itemElement: (user) => `${user.reviewed_level_count}`,
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
