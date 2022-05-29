import "./Dim.css";
import { useEffect } from "react";

interface DimProps {
  isActive?: boolean | undefined;
  className?: string | undefined;
  children?: React.ReactNode | undefined;
  onMouseDown?: ((event: React.MouseEvent) => void) | undefined;
  onWheel?: ((event: React.WheelEvent) => void) | undefined;
}

const Dim = ({ isActive, className, children, ...props }: DimProps) => {
  useEffect(() => {
    document.body.classList.toggle("modal-open", !!isActive);
    return () => {
      document.body.classList.toggle("modal-open", false);
    };
  }, [isActive]);

  return (
    <div
      className={`Dim ${className || ""} ${isActive ? "active" : ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Dim };
