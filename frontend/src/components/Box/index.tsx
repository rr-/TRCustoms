import styles from "./index.module.css";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Box = ({ className, children, ...props }: BoxProps) => {
  return (
    <div
      className={`${styles.container} ChildMarginClear ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Box };
