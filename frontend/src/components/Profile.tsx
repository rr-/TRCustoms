import "./Profile.css";
import { useEffect, useCallback, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { IUser, UserService } from "src/services/user.service";
import Loader from "src/shared/components/Loader";
import { UserContext } from "src/shared/contexts/UserContext";
import { formatDateTime } from "src/shared/utils";

interface IProfile {}

const Profile: React.FunctionComponent<IProfile> = () => {
  const myUser = useContext(UserContext).user;
  const { userId }: { userId: string } = useParams();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const user = userId ? await UserService.getUserById(userId) : myUser;
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
            <img alt="User avatar" src={user.avatar_url || "/anonymous.png"} />
            <p>
              Joined: {formatDateTime(user.date_joined) || "unknown"}
              <br />
              Last seen: {formatDateTime(user.last_login) || "never"}
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
