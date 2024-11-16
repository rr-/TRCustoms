import styles from "./index.module.css";

interface ErrorMessageProps {
  error?: any;
  children?: React.ReactNode;
}

const ErrorMessage = ({ error, children }: ErrorMessageProps) => {
  if (error && children) {
    throw new Error("Cannot combine form error with React children.");
  }

  if (children) {
    return (
      <span role="alert" className={styles.wrapper}>
        {children}
      </span>
    );
  }

  if (!error) {
    return null;
  }

  if (error.type === "required") {
    return (
      <span role="alert" className={styles.wrapper}>
        This field is required.
      </span>
    );
  }

  if (error.type === "maxLength") {
    <span role="alert" className={styles.wrapper}>
      Max length exceeded.
    </span>;
  }
  return (
    <span role="alert" className={styles.wrapper}>
      Unknown error.
    </span>
  );
};

export { ErrorMessage };
