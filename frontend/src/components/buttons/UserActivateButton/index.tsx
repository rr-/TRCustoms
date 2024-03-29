import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { IconCheck } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface UserActivateButtonProps {
  user: UserBasic;
}

const UserActivateButton = ({ user }: UserActivateButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await UserService.activate(user.id);
      resetQueries(queryClient, ["user", "users", "auditLogs"]);
    });
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
      >
        Are you sure you want to activate user {user.username}?
      </ConfirmModal>

      <Button icon={<IconCheck />} onClick={handleButtonClick}>
        Activate
      </Button>
    </>
  );
};

export { UserActivateButton };
