import styles from "./index.module.css";
import { useEffect } from "react";

interface DimProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean | undefined;
  children?: React.ReactNode | undefined;
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
      className={`${styles.dim} ${className || ""} ${
        isActive ? styles.active : ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Dim };
