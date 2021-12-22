import type { User } from "src/services/user.service";

interface UserPictureProps {
  user: User;
  className?: string;
}

const UserPicture = ({ user, className }: UserPictureProps) => {
  return (
    <img
      className={className}
      alt={`Avatar for ${user.username}`}
      src={
        user.has_picture ? `/api/users/${user.id}/picture` : "/anonymous.png"
      }
    />
  );
};

export default UserPicture;
