import "./UserPicture.css";
import type { UserDetails } from "src/services/user.service";

interface UserPictureProps {
  user: UserDetails;
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
