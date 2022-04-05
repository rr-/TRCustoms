import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconCheck } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

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
    <PushButton icon={<IconCheck />} onClick={handleUnbanButtonClick}>
      Unban
    </PushButton>
  );
};

export { UserUnbanPushButton };
