import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconCheck } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";

interface UserActivateButtonProps {
  user: UserBasic;
}

const UserActivateButton = ({ user }: UserActivateButtonProps) => {
  const handleConfirm = useEntityAction(
    () => UserService.activate(user.id),
    [queryKeys.users.all, queryKeys.auditLogs.all],
  );

  return (
    <ConfirmButton
      icon={<IconCheck />}
      text={`Are you sure you want to activate user ${user.username}?`}
      buttonLabel="Activate"
      onConfirm={handleConfirm}
    />
  );
};

export { UserActivateButton };
