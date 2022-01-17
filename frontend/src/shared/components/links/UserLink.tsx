import { Link } from "react-router-dom";
import { UserPermission } from "src/services/user.service";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface User {
  id: number | null;
  username: string;
}

interface UserLinkProps {
  user: User;
  label?: string | null;
}

const UserLink = ({ user, label }: UserLinkProps) => {
  const { id, username } = user;
  const text = label || username;
  return (
    <PermissionGuard require={UserPermission.listUsers} alternative={username}>
      {id ? <Link to={`/users/${id}`}>{text}</Link> : <>text</>}
    </PermissionGuard>
  );
};

export { UserLink };
