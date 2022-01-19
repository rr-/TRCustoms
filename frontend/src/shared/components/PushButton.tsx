import "./PushButton.css";
import { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { To } from "react-router-dom";

interface PushButtonProps {
  to?: To | string | null;
  disableTimeout?: boolean;
  isPlain?: boolean;
  onClick?: () => void;
  icon?: React.ReactElement | null;
  children: React.ReactNode | string;
}

const PushButton = ({
  to,
  disableTimeout,
  onClick,
  isPlain,
  target,
  icon,
  children,
}: PushButtonProps) => {
  const [timer, setTimer] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const linkClick = (event: React.MouseEvent) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!disableTimeout) {
      setIsDisabled(true);
      setTimer(window.setTimeout(() => setIsDisabled(false), 5000));
    }
    if (onClick) {
      onClick();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <Link
      className={`PushButton ${
        isPlain ? "PushButton--link" : "PushButton--button"
      } ${isDisabled && "PushButton--disabled"}`}
      target={target}
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
