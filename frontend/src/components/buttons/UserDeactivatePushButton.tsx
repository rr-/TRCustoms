import { BanIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils";
import { resetQueries } from "src/utils";

interface UserDeactivatePushButtonProps {
  user: UserBasic;
  onComplete?: (() => void) | undefined;
  children?: React.ReactNode | undefined;
}

const UserDeactivatePushButton = ({
  user,
  onComplete,
  children,
}: UserDeactivatePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleDeactivateButtonClick = () => {
    const reason = prompt("Please provide the reason for rejecting this user.");
    if (!reason) {
      return;
    }
    showAlertOnError(async () => {
      await UserService.deactivate(user.id, reason);
      onComplete?.();
      resetQueries(queryClient, ["user", "users", "auditLogs"]);
    });
  };

  return (
    <PushButton
      icon={<BanIcon className="icon" />}
      onClick={handleDeactivateButtonClick}
    >
      {children || "Reject activation"}
    </PushButton>
  );
};

export { UserDeactivatePushButton };
