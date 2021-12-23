import "./PushButton.css";
import { Link } from "react-router-dom";
import type { To } from "react-router-dom";

interface PushButtonProps {
  to: To;
  target?: string | null;
  children: React.ReactNode | string;
}

const PushButton = ({ to, target, children }: PushButtonProps) => {
  return (
    <Link className="PushButton" target={target} to={to}>
      {children}
    </Link>
  );
};

export default PushButton;
