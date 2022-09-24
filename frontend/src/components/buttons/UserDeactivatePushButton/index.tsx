import { useState } from "react";
import { useQueryClient } from "react-query";
import { PushButton } from "src/components/PushButton";
import { IconBan } from "src/components/icons";
import { PromptModal } from "src/components/modals/PromptModal";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface UserDeactivatePushButtonProps {
  user: UserBasic;
  onComplete?: (() => void) | undefined;
  children?: React.ReactNode | undefined;
}

const UserDeactivatePushButton = ({
  user,
  onComplete,
  children,
}: UserDeactivatePushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleModalConfirm = (reason: string) => {
    showAlertOnError(async () => {
      await UserService.deactivate(user.id, reason);
      onComplete?.();
      resetQueries(queryClient, ["user", "users", "auditLogs"]);
    });
  };

  return (
    <>
      <PromptModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleModalConfirm}
        label="Reason"
      >
        Please provide the reason for rejecting this user.
      </PromptModal>

      <PushButton icon={<IconBan />} onClick={handleButtonClick}>
        {children || "Reject activation"}
      </PushButton>
    </>
  );
};

export { UserDeactivatePushButton };
