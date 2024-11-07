import styles from "./index.module.css";
import { useState } from "react";
import { useEffect } from "react";
import { forwardRef } from "react";
import { createPortal } from "react-dom";
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
    const [isDimActive, setIsDimActive] = useState(isActive);

    useEffect(() => setIsDimActive(isActive), [isActive]);

    const handleDimClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        event.stopPropagation();
        event.preventDefault();
        setIsDimActive(false);
      }
    };

    const handleCloseClick = () => {
      setIsDimActive(false);
    };

    const handleTransitionEnd = () => {
      const state = document.body.classList.contains("modal-open");
      if (!state) {
        onIsActiveChange(false);
      }
    };

    return createPortal(
      <Dim
        isActive={isDimActive}
        onMouseDown={handleDimClick}
        onTransitionEnd={handleTransitionEnd}
      >
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
      </Dim>,
      document.getElementById("root") as Element
    );
  }
);

export { BaseModal };
