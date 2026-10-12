import { useQuery } from "@tanstack/react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconCheck } from "src/components/icons";
import { IconXCircle } from "src/components/icons";
import type { MessageSettings } from "src/services/MessageService";
import { MessageService } from "src/services/MessageService";
import type { UserBasic } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";

interface UserBlockButtonProps {
  user: UserBasic;
}

const UserBlockButton = ({ user }: UserBlockButtonProps) => {
  const settingsResult = useQuery<MessageSettings, Error>({
    queryKey: queryKeys.messages.settings(),
    queryFn: MessageService.getSettings,
  });
  const isBlocked = !!settingsResult.data?.blocked_users.some(
    (blockedUser) => blockedUser.id === user.id,
  );
  const handleConfirm = useEntityAction(
    () => MessageService.setBlocked(user.id, !isBlocked),
    [queryKeys.messages.settings(), queryKeys.users.all],
  );

  if (!settingsResult.data) {
    return null;
  }

  return isBlocked ? (
    <ConfirmButton
      icon={<IconCheck />}
      text={`Unblock ${user.username}? They will be able to message you again.`}
      buttonLabel="Unblock"
      onConfirm={handleConfirm}
    />
  ) : (
    <ConfirmButton
      icon={<IconXCircle />}
      text={`Block ${user.username}? They will no longer be able to message you.`}
      buttonLabel="Block"
      onConfirm={handleConfirm}
    />
  );
};

export { UserBlockButton };
