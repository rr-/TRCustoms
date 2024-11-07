import { useNavigate } from "react-router-dom";
import { WalkthroughApproveButton } from "src/components/buttons/WalkthroughApproveButton";
import { WalkthroughDeleteButton } from "src/components/buttons/WalkthroughDeleteButton";
import { WalkthroughEditButton } from "src/components/buttons/WalkthroughEditButton";
import { WalkthroughPublishButton } from "src/components/buttons/WalkthroughPublishButton";
import { WalkthroughRejectButton } from "src/components/buttons/WalkthroughRejectButton";
import { WalkthroughUpdateVideoButton } from "src/components/buttons/WalkthroughUpdateVideoButton";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserPermission } from "src/services/UserService";
import { WalkthroughType } from "src/services/WalkthroughService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";

interface WalkthroughActionsProps {
  walkthrough: WalkthroughDetails;
}

const WalkthroughActions = ({ walkthrough }: WalkthroughActionsProps) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    navigate("/");
  };

  return (
    <>
      <PermissionGuard
        require={UserPermission.editWalkthroughs}
        owningUsers={walkthrough.author ? [walkthrough.author] : []}
      >
        {walkthrough.status === WalkthroughStatus.Draft && (
          <WalkthroughPublishButton walkthrough={walkthrough} />
        )}

        {walkthrough.walkthrough_type === WalkthroughType.Link ? (
          <WalkthroughUpdateVideoButton walkthrough={walkthrough} />
        ) : (
          walkthrough.walkthrough_type === WalkthroughType.Text && (
            <WalkthroughEditButton walkthrough={walkthrough} />
          )
        )}
      </PermissionGuard>

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
  );
};

export { WalkthroughActions };
