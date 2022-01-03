import "./PushButton.css";
import { useCallback } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { To } from "react-router-dom";

interface PushButtonProps {
  to?: To;
  isPlain?: boolean;
  onClick?: () => any;
  target?: string;
  children: React.ReactNode | string;
}

const PushButton = ({
  to,
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
        return;
      }
      setIsDisabled(true);
      window.setTimeout(() => setIsDisabled(false), 5000);
      if (onClick) {
        onClick();
        e.preventDefault();
      }
    },
    [isDisabled, setIsDisabled, onClick]
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
