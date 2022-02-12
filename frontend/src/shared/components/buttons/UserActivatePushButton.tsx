import { CheckIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import { UserService } from "src/services/user.service";
import type { UserBasic } from "src/services/user.service";
import { PushButton } from "src/shared/components/PushButton";
import { showAlertOnError } from "src/shared/utils";
import { resetQueries } from "src/shared/utils";

interface UserActivatePushButtonProps {
  user: UserBasic;
}

const UserActivatePushButton = ({ user }: UserActivatePushButtonProps) => {
  const queryClient = useQueryClient();

  const handleActivateButtonClick = () => {
    if (!window.confirm("Are you sure you want to activate this user?")) {
      return;
    }
    showAlertOnError(async () => {
      await UserService.activate(user.id);
      resetQueries(queryClient, ["users", "auditLogs"]);
    });
  };

  return (
    <PushButton
      icon={<CheckIcon className="icon" />}
      onClick={handleActivateButtonClick}
    >
      Activate
    </PushButton>
  );
};

export { UserActivatePushButton };
