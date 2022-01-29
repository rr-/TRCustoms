import { Link } from "react-router-dom";
import { UserNested } from "src/services/user.service";
import { UserPermission } from "src/services/user.service";
import { PermissionGuard } from "src/shared/components/PermissionGuard";

interface UserLinkProps {
  className?: string | undefined;
  user: UserNested;
  children?: React.ReactNode | undefined;
}

const UserLink = ({ user, className, children }: UserLinkProps) => {
  const { id, username } = user;
  children ||= username;
  return (
    <PermissionGuard require={UserPermission.listUsers} alternative={username}>
      {id ? (
        <Link className={className} to={`/users/${id}`}>
          {children}
        </Link>
      ) : (
        <span className={className}>{children}</span>
      )}
    </PermissionGuard>
  );
};

export { UserLink };
