import { useQueryClient } from "@tanstack/react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { IconCheck } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface UserUnbanButtonProps {
  user: UserBasic;
}

const UserUnbanButton = ({ user }: UserUnbanButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await UserService.unban(user.id);
    resetQueries(queryClient, ["user", "users", "auditLogs"]);
  };

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
