import { Link } from "react-router-dom";
import { UserNested } from "src/services/user.service";
import { UserPermission } from "src/services/user.service";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface UserLinkProps {
  user: UserNested;
  label?: string | null;
}

const UserLink = ({ user, label }: UserLinkProps) => {
  const { id, username } = user;
  label ||= username;
  return (
    <PermissionGuard require={UserPermission.listUsers} alternative={username}>
      {id ? <Link to={`/users/${id}`}>{label}</Link> : <>label</>}
    </PermissionGuard>
  );
};

export { UserLink };
