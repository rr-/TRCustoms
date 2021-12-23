import { Link } from "react-router-dom";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface User {
  id: number;
  username: string;
}

interface UserLinkProps {
  user: User;
  variant?: "edit" | null;
  label?: string | null;
}

const UserLink = ({ user, variant, label }: UserLinkProps) => {
  const { id, username } = user;
  if (variant === "edit") {
    return (
      <PermissionGuard require={"canEditUsers"} entity={user}>
        <Link to={`/users/${id}/edit`}>{label || `Edit ${username}`}</Link>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard require={"canListUsers"} alternative={username}>
      <Link to={`/users/${id}`}>{label || username}</Link>
    </PermissionGuard>
  );
};

export default UserLink;
