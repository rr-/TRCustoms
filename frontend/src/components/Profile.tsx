import "./Profile.css";
import ReactMarkdown from "react-markdown";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ILevelQuery } from "src/services/level.service";
import { IUser } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import LevelsTable from "src/shared/components/LevelsTable";
import Loader from "src/shared/components/Loader";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import UserPicture from "src/shared/components/UserPicture";
import { DISABLE_PAGING } from "src/shared/types";
import { formatDateTime } from "src/shared/utils";

interface IProfile {}

const Profile: React.FunctionComponent<IProfile> = () => {
  const { userId }: { userId: string } = useParams();

  const userQuery = useQuery<IUser, Error>(["users", userId], async () =>
    UserService.getUserById(+userId)
  );

  if (userQuery.error) {
    return <p>{userQuery.error.message}</p>;
  }

  if (userQuery.isLoading || !userQuery.data) {
    return <Loader />;
  }

  const user = userQuery.data;

  const levelQuery: ILevelQuery = {
    page: DISABLE_PAGING,
    sort: null,
    search: null,
    tags: [],
    genres: [],
    engines: [],
    authors: [user.id],
  };

  return (
    <div id="Profile">
      <aside>
        <UserPicture user={user} />
        <p>
          Joined: {formatDateTime(user.date_joined) || "unknown"}
          <br />
          Last seen: {formatDateTime(user.last_login) || "never"}
          <PermissionGuard require={"canEditUsers"} entity={user}>
            <br />
            <Link to={`/users/${user.id}/edit`}>Edit</Link>
          </PermissionGuard>
        </p>
      </aside>
      <div>
        <section className="Profile--basic-info">
          <h1>{user.username}</h1>
          {`${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
          {user.bio ? (
            <ReactMarkdown children={user.bio} />
          ) : (
            <p>This user prefers to keep an air of mystery around them.</p>
          )}
        </section>

        <section className="Profile--authored-levels">
          <h3>Authored levels</h3>
          <LevelsTable query={levelQuery} />
        </section>
      </div>
    </div>
  );
};

export default Profile;
