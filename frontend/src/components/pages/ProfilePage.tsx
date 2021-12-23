import "./ProfilePage.css";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import type { LevelQuery } from "src/services/level.service";
import type { User } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import LevelsTable from "src/shared/components/LevelsTable";
import Loader from "src/shared/components/Loader";
import { Markdown } from "src/shared/components/Markdown";
import { PermissionGuard } from "src/shared/components/PermissionGuard";
import PushButton from "src/shared/components/PushButton";
import SidebarBox from "src/shared/components/SidebarBox";
import UserLink from "src/shared/components/UserLink";
import UserPicture from "src/shared/components/UserPicture";
import { DISABLE_PAGING } from "src/shared/constants";
import { formatDateTime } from "src/shared/utils";

const ProfilePage = () => {
  const { userId } = useParams();

  const result = useQuery<User, Error>(["users", userId], async () =>
    UserService.getUserById(+userId)
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const user = result.data;

  const levelQuery: LevelQuery = {
    page: DISABLE_PAGING,
    sort: null,
    search: null,
    tags: [],
    genres: [],
    engines: [],
    authors: [user.id],
  };

  return (
    <div id="ProfilePage">
      <header id="ProfilePage--header">
        <h1>{user.username}</h1>
        {user.is_active &&
          `${user.first_name} ${user.last_name}` !== user.username && (
            <h2>
              {user.first_name} {user.last_name}
            </h2>
          )}
      </header>

      <div id="ProfilePage--picture">
        <UserPicture user={user} />
      </div>

      <aside id="ProfilePage--sidebar">
        <SidebarBox
          actions={
            <PermissionGuard require={"canEditUsers"} entity={user}>
              <PushButton to={`/users/{user.id}/edit`}>Edit profile</PushButton>
            </PermissionGuard>
          }
        >
          <dl>
            <dt>Joined</dt>
            <dd>{formatDateTime(user.date_joined) || "unknown"}</dd>

            <dt>Last seen</dt>
            <dd>{formatDateTime(user.last_login) || "never"}</dd>
          </dl>
        </SidebarBox>
      </aside>

      <div id="ProfilePage--main">
        <section id="ProfilePage--basicInfo">
          {user.is_active && user.bio ? (
            <Markdown children={user.bio} />
          ) : (
            <p>This user prefers to keep an air of mystery around them.</p>
          )}
        </section>

        <section id="ProfilePage--authoredLevels">
          <h3>Authored levels</h3>
          <LevelsTable query={levelQuery} />
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
