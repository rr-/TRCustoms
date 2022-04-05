import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface UserBanPushButtonProps {
  user: UserBasic;
}

const UserBanPushButton = ({ user }: UserBanPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleBanButtonClick = () => {
    const reason = prompt("Please provide the reason for banning this user.");
    if (!reason) {
      return;
    }
    showAlertOnError(async () => {
      await UserService.ban(user.id, reason);
      resetQueries(queryClient, ["user", "users", "auditLogs"]);
    });
  };

  return (
    <PushButton icon={<IconBan />} onClick={handleBanButtonClick}>
      Ban
    </PushButton>
  );
};

export { UserBanPushButton };
