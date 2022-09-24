import { useState } from "react";
import { Button } from "src/components/common/Button";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { showAlertOnError } from "src/utils/misc";

interface ConfirmButtonProps {
  icon?: React.ReactElement | undefined;
  text: React.ReactElement | string;
  buttonLabel: string;
  buttonTooltip?: string | undefined;
  onConfirm: () => Promise<void>;
}

const ConfirmButton = ({
  icon,
  text,
  buttonLabel,
  buttonTooltip,
  onConfirm,
}: ConfirmButtonProps) => {
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

      <Button icon={icon} onClick={handleButtonClick} tooltip={buttonTooltip}>
        {buttonLabel}
      </Button>
    </>
  );
};

export { ConfirmButton };
