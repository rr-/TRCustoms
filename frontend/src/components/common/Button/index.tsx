import styles from "./index.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  className?: string | undefined;
  to?: string | null | undefined;
  disableTimeout?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
  children?: React.ReactNode | string | undefined;
  tooltip?: string | undefined;
}

const Button = ({
  className,
  to,
  disableTimeout,
  onClick,
  icon,
  children,
  disabled,
  tooltip,
}: ButtonProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const handleLinkClick = (event: React.MouseEvent) => {
    if (isTimeoutActive || disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!disableTimeout) {
      setIsTimeoutActive(true);
      setTimer(window.setTimeout(() => setIsTimeoutActive(false), 5000));
    }
    if (onClick) {
      onClick();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const classNames = [styles.button];
  if (disabled || isTimeoutActive) {
    classNames.push(styles.disabled);
  }
  if (className) {
    classNames.push(className);
  }

  const inside = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
    </>
  );

  if (to?.includes("://")) {
    // handle external links
    return (
      <a
        title={tooltip}
        rel="noopener noreferrer"
        target="_blank"
        className={classNames.join(" ")}
        onClick={handleLinkClick}
        onAuxClick={handleLinkClick}
        href={to}
      >
        {inside}
      </a>
    );
  }

  return (
    <Link
      title={tooltip}
      className={classNames.join(" ")}
      onClick={handleLinkClick}
      onAuxClick={handleLinkClick}
      to={to || "#"}
    >
      {inside}
    </Link>
  );
};

export { Button };
