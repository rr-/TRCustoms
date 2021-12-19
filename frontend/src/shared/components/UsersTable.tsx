import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import Pager from "src/components/Pager";
import { IUserList } from "src/services/user.service";
import { IUserQuery } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import Loader from "src/shared/components/Loader";
import SortLink from "src/shared/components/SortLink";
import { DISABLE_PAGING } from "src/shared/types";
import { formatDate } from "src/shared/utils";
import { EMPTY_INPUT_PLACEHOLDER } from "src/shared/utils";

const UsersTable = ({ query }: { query: IUserQuery | null }) => {
  const usersQuery = useQuery<IUserList, Error>(["users", query], async () =>
    UserService.getUsers(query)
  );

  if (usersQuery.error) {
    return <p>{usersQuery.error.message}</p>;
  }

  if (usersQuery.isLoading || !usersQuery.data) {
    return <Loader />;
  }

  if (!usersQuery.data.results.length) {
    return <p>There are no users to show.</p>;
  }

  return (
    <>
      <table className="UsersTable borderless">
        <thead>
          <tr>
            <th className="UsersTable--username">
              <SortLink sort={"username"}>User name</SortLink>
            </th>
            <th className="UsersTable--first-name">
              <SortLink sort={"first_name"}>First name</SortLink>
            </th>
            <th className="UsersTable--last-name">
              <SortLink sort={"last_name"}>Last name</SortLink>
            </th>
            <th className="UsersTable--created">
              <SortLink sort={"date_joined"}>Created</SortLink>
            </th>
            <th className="UsersTable--last-login">
              <SortLink sort={"last_login"}>Last login</SortLink>
            </th>
            <th className="UsersTable--authored-level-count">
              <SortLink sort={"authored_level_count"}>Authored levels</SortLink>
            </th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.data.results.map((user) => (
            <tr key={user.id}>
              <td className="UsersTable--username">
                <Link to={`/profile/${user.id}`}>{user.username}</Link>
              </td>
              <td className="UsersTable--first-name">
                {user.first_name || EMPTY_INPUT_PLACEHOLDER}
              </td>
              <td className="UsersTable--last-name">
                {user.last_name || EMPTY_INPUT_PLACEHOLDER}
              </td>
              <td className="UsersTable--created">
                {formatDate(user.date_joined)}
              </td>
              <td className="UsersTable--last-login">
                {formatDate(user.last_login)}
              </td>
              <td className="UsersTable--authored-level-count">
                {user.authored_level_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {query.page !== DISABLE_PAGING && (
        <div id="UsersTable--pager">
          <Pager pagedResponse={usersQuery.data} />
        </div>
      )}
    </>
  );
};

export default UsersTable;
