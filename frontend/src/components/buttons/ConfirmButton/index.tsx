import { useState } from "react";
import { ButtonVariant } from "src/components/common/Button";
import { Button } from "src/components/common/Button";
import { ConfirmModal } from "src/components/modals/ConfirmModal";
import { showAlertOnError } from "src/utils/misc";

interface ConfirmButtonProps {
  icon?: React.ReactElement | undefined;
  text: React.ReactElement | string;
  buttonLabel: string;
  buttonTooltip?: string | undefined;
  buttonVariant?: ButtonVariant;
  onConfirm: () => Promise<void>;
}

const ConfirmButton = ({
  icon,
  text,
  buttonLabel,
  buttonTooltip,
  buttonVariant,
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

      <Button
        icon={icon}
        onClick={handleButtonClick}
        tooltip={buttonTooltip}
        variant={buttonVariant}
      >
        {buttonLabel}
      </Button>
    </>
  );
};

export { ConfirmButton };
