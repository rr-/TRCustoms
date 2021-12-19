import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { IUser } from "src/services/user.service";
import { IUserList } from "src/services/user.service";
import { IUserQuery } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import { IDataTableColumn } from "src/shared/components/DataTable";
import { DataTable } from "src/shared/components/DataTable";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

const UsersTable = ({ query }: { query: IUserQuery | null }) => {
  const usersQuery = useQuery<IUserList, Error>(["users", query], async () =>
    UserService.getUsers(query)
  );

  const columns: IDataTableColumn<IUser>[] = [
    {
      name: "username",
      sortKey: "username",
      label: "User name",
      itemElement: (user) => (
        <Link to={`/profile/${user.id}`}>{user.username}</Link>
      ),
    },
    {
      name: "first-name",
      sortKey: "first_name",
      label: "First name",
      itemElement: (user) => user.first_name || EMPTY_INPUT_PLACEHOLDER,
    },
    {
      name: "last-name",
      sortKey: "last_name",
      label: "Last name",
      itemElement: (user) => user.last_name || EMPTY_INPUT_PLACEHOLDER,
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

  return <DataTable query={usersQuery} columns={columns} itemKey={itemKey} />;
};

export default UsersTable;
