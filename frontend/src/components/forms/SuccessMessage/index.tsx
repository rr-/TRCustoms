import styles from "./index.module.css";

interface SuccessMessageProps {
  children?: React.ReactNode;
}

const SuccessMessage = ({ children }: SuccessMessageProps) => {
  return <span className={styles.wrapper}>{children}</span>;
};

export { SuccessMessage };
