import styles from "./index.module.css";
import { UserPicture } from "src/components/common/UserPicture";
import { UserLink } from "src/components/links/UserLink";
import { UserNested } from "src/services/UserService";

interface UserPicLinkProps {
  user: UserNested | null;
  fallback?: React.ReactNode;
}

const UserPicLink = ({ user, fallback }: UserPicLinkProps) => {
  if (!user) {
    return <>{fallback || "Unknown user"}</>;
  }

  return (
    <UserLink user={user}>
      <span className={styles.wrapper}>
        <UserPicture user={user} /> {user.username}
      </span>
    </UserLink>
  );
};

export { UserPicLink };
