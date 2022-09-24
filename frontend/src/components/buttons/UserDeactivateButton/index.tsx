import { useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "src/components/common/Button";
import { IconBan } from "src/components/icons";
import { PromptModal } from "src/components/modals/PromptModal";
import { UserService } from "src/services/UserService";
import type { UserBasic } from "src/services/UserService";
import { showAlertOnError } from "src/utils/misc";
import { resetQueries } from "src/utils/misc";

interface UserDeactivateButtonProps {
  user: UserBasic;
  onComplete?: (() => void) | undefined;
  children?: React.ReactNode | undefined;
}

const UserDeactivateButton = ({
  user,
  onComplete,
  children,
}: UserDeactivateButtonProps) => {
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

      <Button icon={<IconBan />} onClick={handleButtonClick}>
        {children || "Reject activation"}
      </Button>
    </>
  );
};

export { UserDeactivateButton };
