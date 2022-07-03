import { useQueryClient } from "react-query";
import { PromptPushButton } from "src/components/buttons/PromptPushButton";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface UserBanPushButtonProps {
  user: UserBasic;
}

const UserBanPushButton = ({ user }: UserBanPushButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await UserService.ban(user.id, result);
    resetQueries(queryClient, ["user", "users", "auditLogs"]);
  };

  return (
    <PromptPushButton
      text={<p>Please provide the reason for banning this user.</p>}
      promptLabel="Reason"
      buttonLabel="Ban"
      buttonTooltip="Bans this user from accessing TRCustoms."
      icon={<IconBan />}
      big={true}
      onConfirm={handleConfirm}
    />
  );
};

export { UserBanPushButton };
