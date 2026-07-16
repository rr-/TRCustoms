import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";

interface UserDeactivateButtonProps {
  user: UserBasic;
  onComplete?: (() => void) | undefined;
  children?: React.ReactNode | undefined;
}

const UserDeactivateButton = ({
  user,
  onComplete,
  children,
}: UserDeactivateButtonProps) => {
  const handleConfirm = useEntityAction(
    async (reason: string) => {
      await UserService.deactivate(user.id, reason);
      onComplete?.();
    },
    ["user", "users", "auditLogs"],
  );

  return (
    <PromptButton
      icon={<IconBan />}
      text="Please provide the reason for rejecting this user."
      promptLabel="Reason"
      buttonLabel={children || "Reject activation"}
      onConfirm={handleConfirm}
    />
  );
};

export { UserDeactivateButton };
