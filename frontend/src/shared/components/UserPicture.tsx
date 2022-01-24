import "./UserPicture.css";
import type { User } from "src/services/user.service";

interface UserPictureProps {
  user: User;
  className?: string;
}

const UserPicture = ({ user, className }: UserPictureProps) => {
  return (
    <img
      className={`UserPicture ${className}`}
      alt={`Avatar for ${user.username}`}
      src={user.picture ? user.picture.url : "/anonymous.png"}
    />
  );
};

export { UserPicture };
