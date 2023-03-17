import styles from "./index.module.css";
import { forwardRef } from "react";
import { Link } from "src/components/common/Link";
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
        <div className={styles.modal} ref={ref}>
          <header className={`${styles.modalHeader} ChildMarginClear`}>
            {title}

            <Link className={styles.closeButton} onClick={handleCloseClick}>
              <IconX />
            </Link>
          </header>

          <div className={`${styles.modalBody} ChildMarginClear`}>
            {children}
          </div>

          <footer className={`${styles.buttons} ChildMarginClear`}>
            {buttons}
          </footer>
        </div>
      </Dim>
    );
  }
);

export { BaseModal };
