import "./UserPicture.css";
import type { UploadedFile } from "src/services/FileService";
import type { UserNested } from "src/services/UserService";

interface UserPictureProps {
  user: UserNested & { picture: UploadedFile | null };
  className?: string | undefined;
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
