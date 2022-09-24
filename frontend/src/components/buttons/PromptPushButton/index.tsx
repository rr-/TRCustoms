import { useState } from "react";
import { PushButton } from "src/components/common/PushButton";
import { PromptModal } from "src/components/modals/PromptModal";
import { showAlertOnError } from "src/utils/misc";

interface PromptPushButtonProps {
  icon: React.ReactElement;
  text: React.ReactElement | string;
  promptLabel: string;
  buttonLabel: string;
  buttonTooltip: string;
  onConfirm: (result: string) => Promise<void>;
  big?: boolean | undefined;
}

const PromptPushButton = ({
  icon,
  text,
  promptLabel,
  buttonLabel,
  buttonTooltip,
  onConfirm,
  big,
}: PromptPushButtonProps) => {
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

      <PushButton
        icon={icon}
        onClick={handleButtonClick}
        disableTimeout={true}
        tooltip={buttonTooltip}
      >
        {buttonLabel}
      </PushButton>
    </>
  );
};

export { PromptPushButton };
