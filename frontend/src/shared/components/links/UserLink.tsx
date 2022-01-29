import { Link } from "react-router-dom";
import { UserNested } from "src/services/user.service";
import { UserPermission } from "src/services/user.service";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface UserLinkProps {
  user: UserNested;
  children?: React.ReactNode | undefined;
}

const UserLink = ({ user, children }: UserLinkProps) => {
  const { id, username } = user;
  children ||= username;
  return (
    <PermissionGuard require={UserPermission.listUsers} alternative={username}>
      {id ? <Link to={`/users/${id}`}>{children}</Link> : <>{children}</>}
    </PermissionGuard>
  );
};

export { UserLink };
