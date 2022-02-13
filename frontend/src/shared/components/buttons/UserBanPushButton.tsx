import { BanIcon } from "@heroicons/react/outline";
import { useQueryClient } from "react-query";
import { UserService } from "src/services/user.service";
import type { UserBasic } from "src/services/user.service";
import { PushButton } from "src/shared/components/PushButton";
import { showAlertOnError } from "src/shared/utils";
import { resetQueries } from "src/shared/utils";

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
    <PushButton
      icon={<BanIcon className="icon" />}
      onClick={handleBanButtonClick}
    >
      Ban
    </PushButton>
  );
};

export { UserBanPushButton };
