import "./PushButton.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PushButtonProps {
  to?: string | null | undefined;
  disableTimeout?: boolean | undefined;
  disabled?: boolean | undefined;
  isPlain?: boolean | undefined;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
  children: React.ReactNode | string;
  tooltip?: string | undefined;
}

const PushButton = ({
  to,
  disableTimeout,
  onClick,
  isPlain,
  icon,
  children,
  disabled,
  tooltip,
}: PushButtonProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const linkClick = (event: React.MouseEvent) => {
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

  if (to?.includes("://")) {
    // handle external links
    return (
      <a
        title={tooltip}
        rel="noopener noreferrer"
        target="_blank"
        className={`PushButton ${
          isPlain ? "PushButton--link" : "PushButton--button"
        }`}
        onClick={linkClick}
        onAuxClick={linkClick}
        href={to}
      >
        {icon && <span className="PushButton--icon">{icon}</span>}
        <span className="PushButton--label">{children}</span>
      </a>
    );
  }

  return (
    <Link
      title={tooltip}
      className={`PushButton ${
        isPlain ? "PushButton--link" : "PushButton--button"
      } ${(disabled || isTimeoutActive) && "PushButton--disabled"}`}
      onClick={linkClick}
      onAuxClick={linkClick}
      to={to || "#"}
    >
      {icon && <span className="PushButton--icon">{icon}</span>}
      <span className="PushButton--label">{children}</span>
    </Link>
  );
};

export { PushButton };
