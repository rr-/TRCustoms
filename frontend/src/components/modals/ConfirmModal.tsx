import "./Modal.css";
import { PushButton } from "src/components/PushButton";
import { IconCheck } from "src/components/icons";
import { IconReject } from "src/components/icons";
import { BaseModal } from "src/components/modals/BaseModal";

interface ConfirmModalProps {
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const ConfirmModal = ({
  isActive,
  onIsActiveChange,
  onConfirm,
  children,
}: ConfirmModalProps) => {
  const handleCancelClick = () => {
    onIsActiveChange(false);
  };

  const handleConfirmClick = () => {
    onIsActiveChange(false);
    onConfirm();
  };

  return (
    <BaseModal
      title="Confirmation"
      isActive={isActive}
      onIsActiveChange={onIsActiveChange}
      buttons={
        <>
          <PushButton disableTimeout={true} onClick={handleConfirmClick}>
            <IconCheck />
            Yes
          </PushButton>

          <PushButton disableTimeout={true} onClick={handleCancelClick}>
            <IconReject />
            Cancel
          </PushButton>
        </>
      }
    >
      {children}
    </BaseModal>
  );
};

export { ConfirmModal };
