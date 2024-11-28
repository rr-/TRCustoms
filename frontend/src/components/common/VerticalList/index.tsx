import styles from "./index.module.css";

interface VerticalListProps {
  children: React.ReactNode;
  gap?: "none" | "medium" | "big";
}

const VerticalList = ({ children, gap }: VerticalListProps) => {
  return (
    <div
      className={`${styles.wrapper} ${
        styles[gap ?? "medium"]
      } ChildMarginClear`}
    >
      {children}
    </div>
  );
};

export { VerticalList };
