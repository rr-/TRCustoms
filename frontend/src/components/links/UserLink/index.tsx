import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserBasic } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { useConfig } from "src/stores/config";

interface UserLinkProps {
  className?: string | undefined;
  user: UserBasic;
  children?: React.ReactNode | undefined;
}

const UserLink = ({ user, className, children }: UserLinkProps) => {
  const { config } = useConfig();
  const { id, username } = user;
  children ||= username;
  const to =
    id && id === config.administrator?.id ? "/administration" : `/users/${id}`;

  const fallback = <span className={className}>{children}</span>;

  return (
    <PermissionGuard require={UserPermission.viewUsers} alternative={fallback}>
      {id ? (
        <Link className={className} to={to}>
          {children}
        </Link>
      ) : (
        fallback
      )}
    </PermissionGuard>
  );
};

export { UserLink };
