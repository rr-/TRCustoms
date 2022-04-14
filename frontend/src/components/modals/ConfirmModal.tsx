import "./Modal.css";
import { PushButton } from "src/components/PushButton";
import { IconCheck } from "src/components/icons";
import { IconReject } from "src/components/icons";
import { IconX } from "src/components/icons";
import { Dim } from "src/components/modals/Dim";

interface ConfirmModalProps {
  isActive: boolean;
  onIsActiveChange?: ((isActive: boolean) => void) | undefined;
  onConfirm?: (() => void) | undefined;
  label?: string | undefined;
  children?: React.ReactNode | undefined;
}

const ConfirmModal = ({
  isActive,
  onIsActiveChange,
  onConfirm,
  label,
  children,
}: ConfirmModalProps) => {
  const handleDimClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      event.stopPropagation();
      event.preventDefault();
      onIsActiveChange?.(false);
    }
  };

  const handleCloseClick = () => {
    onIsActiveChange?.(false);
  };

  const handleConfirmClick = () => {
    onIsActiveChange?.(false);
    onConfirm?.();
  };

  return (
    <Dim isActive={isActive} onMouseDown={handleDimClick}>
      <div className="Modal">
        <div className="Modal--body">
          <PushButton
            className="Modal--closeButton"
            isPlain={true}
            disableTimeout={true}
            onClick={handleCloseClick}
          >
            <IconX />
          </PushButton>

          {children}

          <div className="Modal--buttons">
            <PushButton disableTimeout={true} onClick={handleConfirmClick}>
              <IconCheck />
              Yes
            </PushButton>

            <PushButton disableTimeout={true} onClick={handleCloseClick}>
              <IconReject />
              Cancel
            </PushButton>
          </div>
        </div>
      </div>
    </Dim>
  );
};

export { ConfirmModal };
