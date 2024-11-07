import { useState } from "react";
import { Button } from "src/components/common/Button";
import { ButtonVariant } from "src/components/common/Button";
import { PromptModal } from "src/components/modals/PromptModal";
import { showAlertOnError } from "src/utils/misc";

interface PromptButtonProps {
  icon: React.ReactElement;
  text: React.ReactElement | string;
  promptLabel: string;
  buttonLabel: string;
  buttonTooltip: string;
  onConfirm: (result: string) => Promise<void>;
  buttonVariant?: ButtonVariant;
  big?: boolean | undefined;
}

const PromptButton = ({
  icon,
  text,
  promptLabel,
  buttonLabel,
  buttonTooltip,
  buttonVariant,
  onConfirm,
  big,
}: PromptButtonProps) => {
  const [isModalActive, setIsModalActive] = useState(false);

  const handleButtonClick = () => {
    setIsModalActive(true);
  };

  const handleConfirm = (result: string) => {
    showAlertOnError(async () => onConfirm(result));
  };

  return (
    <>
      <PromptModal
        isActive={isModalActive}
        onIsActiveChange={setIsModalActive}
        onConfirm={handleConfirm}
        label={promptLabel}
        big={big}
      >
        {text}
      </PromptModal>

      <Button
        icon={icon}
        onClick={handleButtonClick}
        disableTimeout={true}
        tooltip={buttonTooltip}
        variant={buttonVariant}
      >
        {buttonLabel}
      </Button>
    </>
  );
};

export { PromptButton };
