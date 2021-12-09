import { IUser } from "src/services/user.service";

interface IUserPicture {
  user: IUser;
  className?: string;
}

const UserPicture: React.FunctionComponent<IUserPicture> = ({
  user,
  className,
}: IUserPicture) => {
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
