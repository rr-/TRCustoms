import { useNavigate } from "react-router-dom";
import { DefinitionItemGroup } from "src/components/DefinitionList";
import { DefinitionItem } from "src/components/DefinitionList";
import { DefinitionList } from "src/components/DefinitionList";
import { PermissionGuard } from "src/components/PermissionGuard";
import { LoggedInUserGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SectionHeader } from "src/components/Section";
import { SidebarBox } from "src/components/SidebarBox";
import { UserPicture } from "src/components/UserPicture";
import { UserActivatePushButton } from "src/components/buttons/UserActivatePushButton";
import { UserBanPushButton } from "src/components/buttons/UserBanPushButton";
import { UserDeactivatePushButton } from "src/components/buttons/UserDeactivatePushButton";
import { UserUnbanPushButton } from "src/components/buttons/UserUnbanPushButton";
import { IconGlobe } from "src/components/icons";
import { IconHeart } from "src/components/icons";
import { IconPencil } from "src/components/icons";
import type { UserDetails } from "src/services/UserService";
import { UserPermission } from "src/services/UserService";
import { formatDate } from "src/utils/string";

interface UserSidebarProps {
  user: UserDetails;
}

const UserSidebar = ({ user }: UserSidebarProps) => {
  const navigate = useNavigate();

  const handleUserRejection = () => {
    navigate("/");
  };

  return (
    <SidebarBox
      header={
        <div className="UserPage--picture">
          <UserPicture user={user} />
        </div>
      }
      actions={
        <>
          {user.website_url && (
            <PushButton to={user.website_url} icon={<IconGlobe />}>
              Website
            </PushButton>
          )}
          {user.donation_url && (
            <PushButton to={user.donation_url} icon={<IconHeart />}>
              Donate
            </PushButton>
          )}
          <PermissionGuard require={UserPermission.uploadLevels}>
            <LoggedInUserGuard user={user}>
              <PushButton to={"/my-submissions"}>My submissions</PushButton>
            </LoggedInUserGuard>
          </PermissionGuard>
          {user.is_active ? (
            <>
              <PermissionGuard
                require={UserPermission.editUsers}
                owningUsers={[user]}
              >
                <PushButton icon={<IconPencil />} to={`/users/${user.id}/edit`}>
                  Edit profile
                </PushButton>
              </PermissionGuard>
              <PermissionGuard require={UserPermission.manageUsers}>
                {user.is_banned ? (
                  <UserUnbanPushButton user={user} />
                ) : (
                  !user.is_superuser && <UserBanPushButton user={user} />
                )}
                {!user.is_superuser && (
                  <UserDeactivatePushButton user={user}>
                    Deactivate
                  </UserDeactivatePushButton>
                )}
              </PermissionGuard>
            </>
          ) : user.is_pending_activation ? (
            <PermissionGuard require={UserPermission.manageUsers}>
              <UserActivatePushButton user={user} />
              {!user.is_superuser && (
                <UserDeactivatePushButton
                  onComplete={handleUserRejection}
                  user={user}
                />
              )}
            </PermissionGuard>
          ) : undefined}
        </>
      }
    >
      <DefinitionList>
        <DefinitionItemGroup>
          <DefinitionItem span={true}>
            <SectionHeader>User info</SectionHeader>
          </DefinitionItem>

          <DefinitionItem term="Joined">
            {formatDate(user.date_joined) || "Unknown"}
          </DefinitionItem>

          <DefinitionItem term="Country">
            {user.country?.name || "Unknown"}
          </DefinitionItem>

          {!!(user.trle_reviewer_id && user.trle_author_id) && (
            <DefinitionItem term="Links">
              {user.trle_reviewer_id && (
                <a
                  href={`https://www.trle.net/sc/reviewerfeatures.php?rid=${user.trle_reviewer_id}`}
                >
                  TRLE.net (reviewer)
                </a>
              )}
              <br />
              {user.trle_author_id && (
                <a
                  href={`https://www.trle.net/sc/authorfeatures.php?aid=${user.trle_author_id}`}
                >
                  TRLE.net (author)
                </a>
              )}
            </DefinitionItem>
          )}
        </DefinitionItemGroup>

        <DefinitionItemGroup>
          <DefinitionItem span={true}>
            <SectionHeader>User submissions</SectionHeader>
          </DefinitionItem>

          <DefinitionItem term="Levels authored">
            {user.authored_level_count}
          </DefinitionItem>

          <DefinitionItem term="Reviews posted">
            {user.reviewed_level_count}
          </DefinitionItem>
        </DefinitionItemGroup>
      </DefinitionList>
    </SidebarBox>
  );
};

export { UserSidebar };
