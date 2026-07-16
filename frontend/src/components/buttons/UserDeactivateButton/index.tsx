import { useQueryClient } from "@tanstack/react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

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
  const queryClient = useQueryClient();

  const handleConfirm = async (reason: string) => {
    await UserService.deactivate(user.id, reason);
    onComplete?.();
    resetQueries(queryClient, ["user", "users", "auditLogs"]);
  };

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
