import "./index.css";
import type { UploadedFile } from "src/services/FileService";
import type { UserNested } from "src/services/UserService";

enum UserPictureMode {
  Full = "full",
  Medium = "medium",
  Small = "small",
}

interface UserPictureProps {
  mode?: UserPictureMode | undefined;
  user: UserNested & { picture: UploadedFile | null };
  className?: string | undefined;
}

const UserPicture = ({ user, className, mode }: UserPictureProps) => {
  mode ??= UserPictureMode.Small;
  return (
    <img
      className={`UserPicture ${className} ${mode}`}
      alt={`Avatar for ${user.username}`}
      src={user.picture ? user.picture.url : "/anonymous.svg"}
    />
  );
};

export { UserPictureMode, UserPicture };
