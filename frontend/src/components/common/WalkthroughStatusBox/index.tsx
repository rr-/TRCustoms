import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { PermissionGuard } from "src/components/common/PermissionGuard";
import { UserPermission } from "src/services/UserService";
import { WalkthroughStatus } from "src/services/WalkthroughService";
import type { WalkthroughDetails } from "src/services/WalkthroughService";

interface WalkthroughStatusBoxProps {
  walkthrough: WalkthroughDetails;
  showSubmitCta: boolean;
}

const WalkthroughStatusBox = ({
  walkthrough,
  showSubmitCta,
}: WalkthroughStatusBoxProps) => {
  switch (walkthrough.status) {
    case WalkthroughStatus.Draft:
      return (
        <InfoMessage type={InfoMessageType.Info}>
          This walkthrough is a draft.
          {showSubmitCta && (
            <PermissionGuard
              require={UserPermission.editWalkthroughs}
              owningUsers={walkthrough.author ? [walkthrough.author] : []}
            >
              <br />
              To mark it as ready for approval, please click the "Submit for
              approval" button.
            </PermissionGuard>
          )}
        </InfoMessage>
      );
    case WalkthroughStatus.PendingApproval:
      return (
        <InfoMessage type={InfoMessageType.Info}>
          This walkthrough is currently pending approval.
        </InfoMessage>
      );
    case WalkthroughStatus.Rejected:
      return (
        <InfoMessage type={InfoMessageType.Warning}>
          This walkthrough was rejected by staff.
          {walkthrough.rejection_reason && (
            <>
              <br />
              Reason: {walkthrough.rejection_reason}
            </>
          )}
        </InfoMessage>
      );
  }

  return null;
};

export { WalkthroughStatusBox };
