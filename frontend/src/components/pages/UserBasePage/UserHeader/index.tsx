import { useNavigate } from "react-router-dom";
import { UserActivateButton } from "src/components/buttons/UserActivateButton";
import { UserBanButton } from "src/components/buttons/UserBanButton";
import { UserDeactivateButton } from "src/components/buttons/UserDeactivateButton";
import { UserUnbanButton } from "src/components/buttons/UserUnbanButton";
import { Button } from "src/components/common/Button";
import { HeaderWithButtons } from "src/components/common/HeaderWithButtons";
import { PageHeader } from "src/components/common/PageHeader";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SmartWrap } from "src/components/common/SmartWrap";
import { IconPencil } from "src/components/icons";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";

interface UserHeaderProps {
  user: UserDetails;
}

const UserHeader = ({ user }: UserHeaderProps) => {
  const navigate = useNavigate();

  const handleUserRejection = () => {
    navigate("/");
  };

  const subheader = `${user.first_name} ${user.last_name}`.trim();
  const showSubheader =
    user.is_active && subheader && subheader !== user.username;

  const header = (
    <PageHeader
      header={<SmartWrap text={`${user.username}'s profile`} />}
      subheader={showSubheader ? <SmartWrap text={subheader} /> : undefined}
    />
  );

  const buttons = user.is_active ? (
    <>
      <PermissionGuard require={UserPermission.editUsers} owningUsers={[user]}>
        <Button icon={<IconPencil />} to={`/users/${user.id}/edit`}>
          Edit profile
        </Button>
      </PermissionGuard>

      <PermissionGuard require={UserPermission.manageUsers}>
        {user.is_banned ? (
          <UserUnbanButton user={user} />
        ) : (
          !user.is_superuser && <UserBanButton user={user} />
        )}
        {!user.is_superuser && (
          <UserDeactivateButton user={user}>Deactivate</UserDeactivateButton>
        )}
      </PermissionGuard>
    </>
  ) : user.is_pending_activation ? (
    <PermissionGuard require={UserPermission.manageUsers}>
      <UserActivateButton user={user} />
      {!user.is_superuser && (
        <UserDeactivateButton onComplete={handleUserRejection} user={user} />
      )}
    </PermissionGuard>
  ) : (
    <></>
  );

  return <HeaderWithButtons header={header} buttons={buttons} />;
};

export { UserHeader };
