import "./PushButton.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PushButtonProps {
  className?: string | undefined;
  to?: string | null | undefined;
  disableTimeout?: boolean | undefined;
  disabled?: boolean | undefined;
  isSubmit?: boolean | undefined;
  isPlain?: boolean | undefined;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
  children?: React.ReactNode | string | undefined;
  tooltip?: string | undefined;
}

const PushButton = ({
  className,
  to,
  disableTimeout,
  onClick,
  isSubmit,
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

  const classNames = [
    "PushButton",
    isPlain ? "PushButton--link" : "PushButton--button",
  ];
  if (disabled || isTimeoutActive) {
    classNames.push("PushButton--disabled");
  }
  if (className) {
    classNames.push(className);
  }

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
        {icon && <span className="PushButton--icon">{icon}</span>}
        {children && <span className="PushButton--label">{children}</span>}
      </a>
    );
  }

  return (
    <Link
      title={tooltip}
      className={classNames.join(" ")}
      onClick={handleLinkClick}
      onAuxClick={handleLinkClick}
      type={isSubmit ? "submit" : undefined}
      role={isSubmit ? "submit" : "button"}
      to={to || "#"}
    >
      {icon && <span className="PushButton--icon">{icon}</span>}
      {children && <span className="PushButton--label">{children}</span>}
    </Link>
  );
};

export { PushButton };
