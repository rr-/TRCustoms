import { useNavigate } from "react-router-dom";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SidebarBox } from "src/components/SidebarBox";
import { WalkthroughApprovePushButton } from "src/components/buttons/WalkthroughApprovePushButton";
import { WalkthroughDeletePushButton } from "src/components/buttons/WalkthroughDeletePushButton";
import { WalkthroughRejectPushButton } from "src/components/buttons/WalkthroughRejectPushButton";
import { WalkthroughUpdateVideoPushButton } from "src/components/buttons/WalkthroughUpdateVideoPushButton";
import { IconPencil } from "src/components/icons";
import { MarkdownTOC } from "src/components/markdown/MarkdownTOC";
import { UserPermission } from "src/services/UserService";
import { WalkthroughType } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";

interface WalkthroughSidebarProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughSidebar = ({ walkthrough }: WalkthroughSidebarProps) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    navigate("/");
  };

  return (
    <SidebarBox
      actions={
        <>
          {walkthrough.walkthrough_type === WalkthroughType.Link ? (
            <PermissionGuard
              require={UserPermission.editUsers}
              owningUsers={walkthrough.author ? [walkthrough.author] : []}
            >
              <WalkthroughUpdateVideoPushButton walkthrough={walkthrough} />
            </PermissionGuard>
          ) : (
            walkthrough.walkthrough_type === WalkthroughType.Text && (
              <PermissionGuard
                require={UserPermission.editUsers}
                owningUsers={walkthrough.author ? [walkthrough.author] : []}
              >
                <PushButton
                  icon={<IconPencil />}
                  to={`/walkthroughs/${walkthrough.id}/edit`}
                >
                  Edit
                </PushButton>
              </PermissionGuard>
            )
          )}

          <PermissionGuard require={UserPermission.editWalkthroughs}>
            <WalkthroughRejectPushButton walkthrough={walkthrough} />
            {!walkthrough.is_approved && (
              <WalkthroughApprovePushButton walkthrough={walkthrough} />
            )}
          </PermissionGuard>
          <PermissionGuard require={UserPermission.deleteWalkthroughs}>
            <WalkthroughDeletePushButton
              walkthrough={walkthrough}
              onComplete={handleDelete}
            />
          </PermissionGuard>
        </>
      }
    >
      <MarkdownTOC>{walkthrough.text}</MarkdownTOC>
    </SidebarBox>
  );
};

export { WalkthroughSidebar };
