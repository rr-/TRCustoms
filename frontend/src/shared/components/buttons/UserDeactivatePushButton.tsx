import { BanIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import { UserService } from "src/services/user.service";
import type { UserBasic } from "src/services/user.service";
import { PushButton } from "src/shared/components/PushButton";
import { showAlertOnError } from "src/shared/utils";
import { resetQueries } from "src/shared/utils";

interface UserDeactivatePushButtonProps {
  user: UserBasic;
  children?: React.ReactNode | undefined;
}

const UserDeactivatePushButton = ({
  user,
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
      resetQueries(queryClient, ["users", "auditLogs"]);
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
