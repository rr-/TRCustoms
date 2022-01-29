import "./UserPicture.css";
import type { UploadedFile } from "src/services/file.service";
import type { UserNested } from "src/services/user.service";

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
