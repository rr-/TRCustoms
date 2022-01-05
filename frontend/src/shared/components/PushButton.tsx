import "./PushButton.css";
import { useCallback } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { To } from "react-router-dom";

interface PushButtonProps {
  to?: To;
  disableTimeout?: boolean;
  isPlain?: boolean;
  onClick?: () => any;
  target?: string;
  children: React.ReactNode | string;
}

const PushButton = ({
  to,
  disableTimeout,
  onClick,
  isPlain,
  target,
  children,
}: PushButtonProps) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const linkClick = useCallback(
    (e) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!disableTimeout) {
        setIsDisabled(true);
        window.setTimeout(() => setIsDisabled(false), 5000);
      }
      if (onClick) {
        onClick();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isDisabled, setIsDisabled, disableTimeout, onClick]
  );

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
      {children}
    </Link>
  );
};

export default PushButton;
