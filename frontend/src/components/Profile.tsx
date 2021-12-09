import "./Profile.css";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { IUser } from "src/services/user.service";
import { UserService } from "src/services/user.service";
import Loader from "src/shared/components/Loader";
import PermissionGuard from "src/shared/components/PermissionGuard";
import UserPicture from "src/shared/components/UserPicture";
import { UserContext } from "src/shared/contexts/UserContext";
import { formatDateTime } from "src/shared/utils";

interface IProfile {}

const Profile: React.FunctionComponent<IProfile> = () => {
  const myUser = useContext(UserContext).user;
  const { userId }: { userId: string } = useParams();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const user = userId ? await UserService.getUserById(+userId) : myUser;
    setUser(user);
    setIsLoading(false);
  }, [userId, myUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div id="Profile">
      {isLoading ? (
        <Loader />
      ) : user ? (
        <>
          <aside>
            <UserPicture user={user} />
            <p>
              Joined: {formatDateTime(user.date_joined) || "unknown"}
              <br />
              Last seen: {formatDateTime(user.last_login) || "never"}
              <PermissionGuard require={"canEditUsers"} entity={user}>
                <br />
                <Link to={`/profile/${user.id}/edit`}>Edit</Link>
              </PermissionGuard>
            </p>
          </aside>
          <section>
            <h1>{user.username}</h1>
            <h2>
              {user.first_name} {user.last_name}
            </h2>
            {user.bio ? (
              <ReactMarkdown children={user.bio} />
            ) : (
              <p>This user prefers to keep an air of mystery around them.</p>
            )}
          </section>
        </>
      ) : (
        <p>This user does not exist.</p>
      )}
    </div>
  );
};

export default Profile;
