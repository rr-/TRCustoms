import styles from "./index.module.css";
import React, { useState, useRef, useEffect, ReactNode } from "react";
import { IconMenu } from "src/components/icons/IconMenu";

interface BurgerMenuProps {
  children: ReactNode;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        className={`${styles.icon} ${isOpen ? styles.open : ""}`}
        onClick={handleClick}
      >
        <IconMenu />
      </button>
      <div className={`${styles.content} ${isOpen ? styles.open : ""}`}>
        {children}
      </div>
    </div>
  );
};

export { BurgerMenu };
