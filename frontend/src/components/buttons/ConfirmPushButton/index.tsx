import { useState } from "react";
import { PushButton } from "src/components/common/PushButton";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { showAlertOnError } from "src/utils/misc";

interface ConfirmPushButtonProps {
  icon?: React.ReactElement | undefined;
  text: React.ReactElement | string;
  buttonLabel: string;
  buttonTooltip?: string | undefined;
  onConfirm: () => Promise<void>;
}

const ConfirmPushButton = ({
  icon,
  text,
  buttonLabel,
  buttonTooltip,
  onConfirm,
}: ConfirmPushButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);

  const handleButtonClick = async () => {
    setIsModalActive(true);
  };

  const handleConfirm = () => {
    showAlertOnError(onConfirm);
  };

  return (
    <>
      <ConfirmModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleConfirm}
      >
        {text}
      </ConfirmModal>

      <PushButton
        icon={icon}
        onClick={handleButtonClick}
        tooltip={buttonTooltip}
      >
        {buttonLabel}
      </PushButton>
    </>
  );
};

export { ConfirmPushButton };
