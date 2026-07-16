import { PromptButton } from "src/components/buttons/PromptButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconBan } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";

interface UserBanButtonProps {
  user: UserBasic;
}

const UserBanButton = ({ user }: UserBanButtonProps) => {
  const handleConfirm = useEntityAction(
    async (result: string) => {
      await UserService.ban(user.id, result);
    },
    [queryKeys.users.all, queryKeys.auditLogs.all],
  );

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
