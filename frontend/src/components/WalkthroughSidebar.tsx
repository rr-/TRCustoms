import { useNavigate } from "react-router-dom";
import { PermissionGuard } from "src/components/PermissionGuard";
import { PushButton } from "src/components/PushButton";
import { SidebarBox } from "src/components/SidebarBox";
import { WalkthroughApprovePushButton } from "src/components/buttons/WalkthroughApprovePushButton";
import { WalkthroughDeletePushButton } from "src/components/buttons/WalkthroughDeletePushButton";
import { WalkthroughPublishPushButton } from "src/components/buttons/WalkthroughPublishPushButton";
import { WalkthroughRejectPushButton } from "src/components/buttons/WalkthroughRejectPushButton";
import { WalkthroughUpdateVideoPushButton } from "src/components/buttons/WalkthroughUpdateVideoPushButton";
import { IconPencil } from "src/components/icons";
import { MarkdownTOC } from "src/components/markdown/MarkdownTOC";
import { UserPermission } from "src/services/UserService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
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
          {walkthrough.status === WalkthroughStatus.Draft && (
            <PermissionGuard
              require={UserPermission.editWalkthroughs}
              owningUsers={walkthrough.author ? [walkthrough.author] : []}
            >
              <WalkthroughPublishPushButton walkthrough={walkthrough} />
            </PermissionGuard>
          )}

          {walkthrough.walkthrough_type === WalkthroughType.Link ? (
            <PermissionGuard
              require={UserPermission.editWalkthroughs}
              owningUsers={walkthrough.author ? [walkthrough.author] : []}
            >
              <WalkthroughUpdateVideoPushButton walkthrough={walkthrough} />
            </PermissionGuard>
          ) : (
            walkthrough.walkthrough_type === WalkthroughType.Text && (
              <PermissionGuard
                require={UserPermission.editWalkthroughs}
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
            {walkthrough.status !== WalkthroughStatus.Approved && (
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
      {walkthrough.walkthrough_type === WalkthroughType.Text ? (
        <MarkdownTOC>{walkthrough.text}</MarkdownTOC>
      ) : (
        <>
          Watch the full video at{" "}
          <PushButton
            isPlain={true}
            disableTimeout={true}
            to={walkthrough.text}
          >
            {walkthrough.text}
          </PushButton>
          .
        </>
      )}
    </SidebarBox>
  );
};

export { WalkthroughSidebar };
