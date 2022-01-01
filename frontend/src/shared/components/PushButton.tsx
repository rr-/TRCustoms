import "./PushButton.css";
import { Link } from "react-router-dom";
import type { To } from "react-router-dom";

interface PushButtonProps {
  to?: To;
  onClick?: () => any;
  target?: string;
  children: React.ReactNode | string;
}

const PushButton = ({ to, onClick, target, children }: PushButtonProps) => {
  return (
    <Link
      className="PushButton"
      target={target}
      to={to || "#"}
      onClick={(e) => {
        if (onClick) {
          onClick();
          e.preventDefault();
        }
      }}
    >
      {children}
    </Link>
  );
};

export default PushButton;
