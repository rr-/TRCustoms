import "./UsersTable.css";
import { useQuery } from "react-query";
import type { User } from "src/services/user.service";
import type { UserList } from "src/services/user.service";
import type { UserQuery } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import type { DataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import UserLink from "src/shared/components/UserLink";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

interface UsersTableProps {
  query: UserQuery | null;
  onQueryChange?: (query: UserQuery) => any | null;
}

const UsersTable = ({ query, onQueryChange }: UsersTableProps) => {
  const result = useQuery<UserList, Error>(["users", query], async () =>
    UserService.getUsers(query)
  );

  const columns: DataTableColumn<User>[] = [
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
  ];

  const itemKey = (user) => `${user.id}`;

  return (
    <DataTable
      className="UsersTable"
      result={result}
      columns={columns}
      itemKey={itemKey}
      sort={query.sort}
      onSortChange={(sort) => onQueryChange?.({ ...query, sort: sort })}
      onPageChange={(page) => onQueryChange?.({ ...query, page: page })}
    />
  );
};

export default UsersTable;
