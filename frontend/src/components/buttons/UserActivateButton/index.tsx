import { useQueryClient } from "@tanstack/react-query";
import { ConfirmButton } from "src/components/buttons/ConfirmButton";
import { IconCheck } from "src/components/icons";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { resetQueries } from "src/utils/misc";

interface UserActivateButtonProps {
  user: UserBasic;
}

const UserActivateButton = ({ user }: UserActivateButtonProps) => {
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    await UserService.activate(user.id);
    resetQueries(queryClient, ["user", "users", "auditLogs"]);
  };

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
