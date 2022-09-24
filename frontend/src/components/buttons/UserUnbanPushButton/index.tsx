import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconCheck } from "src/components/icons";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface UserUnbanPushButtonProps {
  user: UserBasic;
}

const UserUnbanPushButton = ({ user }: UserUnbanPushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = () => {
    showAlertOnError(async () => {
      await UserService.unban(user.id);
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
        Are you sure you want to unban user {user.username}?
      </ConfirmModal>

      <PushButton icon={<IconCheck />} onClick={handleButtonClick}>
        Unban
      </PushButton>
    </>
  );
};

export { UserUnbanPushButton };
