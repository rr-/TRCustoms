import { CheckIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import { UserService } from "src/services/user.service";
import type { UserBasic } from "src/services/user.service";
import { PushButton } from "src/shared/components/PushButton";
import { showAlertOnError } from "src/shared/utils";
import { resetQueries } from "src/shared/utils";

interface UserUnbanPushButtonProps {
  user: UserBasic;
}

const UserUnbanPushButton = ({ user }: UserUnbanPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleUnbanButtonClick = () => {
    if (!window.confirm("Are you sure you want to unban this user?")) {
      return;
    }
    showAlertOnError(async () => {
      await UserService.unban(user.id);
      resetQueries(queryClient, ["user", "users", "auditLogs"]);
    });
  };

  return (
    <PushButton
      icon={<CheckIcon className="icon" />}
      onClick={handleUnbanButtonClick}
    >
      Unban
    </PushButton>
  );
};

export { UserUnbanPushButton };
