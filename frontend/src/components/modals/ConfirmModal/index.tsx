import { useState } from "react";
import { Button } from "src/components/common/Button";
import { IconCheck } from "src/components/icons";
import { IconReject } from "src/components/icons";
import { BaseModal } from "src/components/modals/BaseModal";

interface ConfirmModalProps {
  title?: string;
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  onConfirm: () => void;
  children: React.ReactNode;
  confirmedChildren?: React.ReactNode;
}

const ConfirmModal = ({
  title,
  isActive,
  onIsActiveChange,
  onConfirm,
  children,
  confirmedChildren,
}: ConfirmModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleCancelClick = () => {
    onIsActiveChange(false);
  };

  const handleConfirmClick = () => {
    if (confirmedChildren) {
      setIsConfirmed(true);
    } else {
      onIsActiveChange(false);
    }
    onConfirm();
  };

  const handleIsActiveChange = (state: boolean) => {
    onIsActiveChange(state);
    if (!state) {
      setIsConfirmed(false);
    }
  };

  return (
    <BaseModal
      title={title || "Confirmation"}
      isActive={isActive}
      onIsActiveChange={handleIsActiveChange}
      buttons={
        isConfirmed ? (
          <></>
        ) : (
          <>
            <Button disableTimeout={true} onClick={handleConfirmClick}>
              <IconCheck />
              Yes
            </Button>

            <Button disableTimeout={true} onClick={handleCancelClick}>
              <IconReject />
              Cancel
            </Button>
          </>
        )
      }
    >
      {isConfirmed ? confirmedChildren : children}
    </BaseModal>
  );
};

export { ConfirmModal };
