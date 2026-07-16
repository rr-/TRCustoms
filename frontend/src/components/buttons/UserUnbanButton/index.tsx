import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { useEntityAction } from "src/components/buttons/useEntityAction";
import { IconCheck } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { queryKeys } from "src/services/queryKeys";

interface UserUnbanButtonProps {
  user: UserBasic;
}

const UserUnbanButton = ({ user }: UserUnbanButtonProps) => {
  const handleConfirm = useEntityAction(
    () => UserService.unban(user.id),
    [queryKeys.users.all, queryKeys.auditLogs.all],
  );

  return (
    <ConfirmButton
      icon={<IconCheck />}
      text={`Are you sure you want to unban user ${user.username}?`}
      buttonLabel="Unban"
      onConfirm={handleConfirm}
    />
  );
};

export { UserUnbanButton };
