import { useNavigate } from "react-router-dom";
import { WalkthroughApproveButton } from "src/components/buttons/WalkthroughApproveButton";
import { WalkthroughDeleteButton } from "src/components/buttons/WalkthroughDeleteButton";
import { WalkthroughPublishButton } from "src/components/buttons/WalkthroughPublishButton";
import { WalkthroughRejectButton } from "src/components/buttons/WalkthroughRejectButton";
import { WalkthroughUpdateVideoButton } from "src/components/buttons/WalkthroughUpdateVideoButton";
import { Button } from "src/components/common/Button";
import { Link } from "src/components/common/Link";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { SidebarBox } from "src/components/common/SidebarBox";
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
              <WalkthroughPublishButton walkthrough={walkthrough} />
            </PermissionGuard>
          )}

          {walkthrough.walkthrough_type === WalkthroughType.Link ? (
            <PermissionGuard
              require={UserPermission.editWalkthroughs}
              owningUsers={walkthrough.author ? [walkthrough.author] : []}
            >
              <WalkthroughUpdateVideoButton walkthrough={walkthrough} />
            </PermissionGuard>
          ) : (
            walkthrough.walkthrough_type === WalkthroughType.Text && (
              <PermissionGuard
                require={UserPermission.editWalkthroughs}
                owningUsers={walkthrough.author ? [walkthrough.author] : []}
              >
                <Button
                  icon={<IconPencil />}
                  to={`/walkthroughs/${walkthrough.id}/edit`}
                >
                  Edit
                </Button>
              </PermissionGuard>
            )
          )}

          <PermissionGuard require={UserPermission.editWalkthroughs}>
            <WalkthroughRejectButton walkthrough={walkthrough} />
            {walkthrough.status !== WalkthroughStatus.Approved && (
              <WalkthroughApproveButton walkthrough={walkthrough} />
            )}
          </PermissionGuard>
          <PermissionGuard require={UserPermission.deleteWalkthroughs}>
            <WalkthroughDeleteButton
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
          <Link to={walkthrough.text}>Click here</Link> to see the full
          video/playlist.
        </>
      )}
    </SidebarBox>
  );
};

export { WalkthroughSidebar };
