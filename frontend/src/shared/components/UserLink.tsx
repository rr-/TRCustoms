import { Link } from "react-router-dom";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface User {
  id: number;
  username: string;
}

interface UserLinkProps {
  user: User;
  label?: string | null;
}

const UserLink = ({ user, label }: UserLinkProps) => {
  const { id, username } = user;
  return (
    <PermissionGuard require={"canListUsers"} alternative={username}>
      <Link to={`/users/${id}`}>{label || username}</Link>
    </PermissionGuard>
  );
};

export default UserLink;
