import { useQueryClient } from "react-query";
import { PromptButton } from "src/components/buttons/PromptButton";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface UserBanButtonProps {
  user: UserBasic;
}

const UserBanButton = ({ user }: UserBanButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async (result: string) => {
    await UserService.ban(user.id, result);
    resetQueries(queryClient, ["user", "users", "auditLogs"]);
  };

  return (
    <PromptButton
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

export { UserBanButton };
