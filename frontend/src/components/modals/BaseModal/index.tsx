import "../index.css";
import { forwardRef } from "react";
import { PushButton } from "src/components/PushButton";
import { IconX } from "src/components/icons";
import { Dim } from "src/components/modals/Dim";

interface BaseModalProps {
  title: string;
  children: React.ReactNode;
  buttons?: React.ReactNode | undefined;
  isActive: boolean;
  onIsActiveChange: (isActive: boolean) => void;
}

const BaseModal = forwardRef<HTMLDivElement, BaseModalProps>(
  ({ title, children, buttons, isActive, onIsActiveChange }, ref) => {
    const handleDimClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        event.stopPropagation();
        event.preventDefault();
        onIsActiveChange(false);
      }
    };

    const handleCloseClick = () => {
      onIsActiveChange(false);
    };

    return (
      <Dim isActive={isActive} onMouseDown={handleDimClick}>
        <div className="Modal" ref={ref}>
          <header className="Modal--header ChildMarginClear">
            {title}

            <PushButton
              className="Modal--closeButton"
              isPlain={true}
              disableTimeout={true}
              onClick={handleCloseClick}
            >
              <IconX />
            </PushButton>
          </header>

          <div className="Modal--body ChildMarginClear">{children}</div>

          <footer className="Modal--buttons ChildMarginClear">{buttons}</footer>
        </div>
      </Dim>
    );
  }
);

export { BaseModal };
