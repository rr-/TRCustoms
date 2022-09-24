import { Link } from "react-router-dom";
import { PermissionGuard } from "src/components/PermissionGuard";
import { UserBasic } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";

interface UserLinkProps {
  className?: string | undefined;
  user: UserBasic;
  children?: React.ReactNode | undefined;
}

const UserLink = ({ user, className, children }: UserLinkProps) => {
  const { id, username } = user;
  children ||= username;

  const fallback = <span className={className}>{children}</span>;

  return (
    <PermissionGuard require={UserPermission.viewUsers} alternative={fallback}>
      {id ? (
        <Link className={className} to={`/users/${id}`}>
          {children}
        </Link>
      ) : (
        fallback
      )}
    </PermissionGuard>
  );
};

export { UserLink };
