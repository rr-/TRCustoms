import styles from "./index.module.css";

interface RadioboxProps {
  label: string | React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  checked: boolean;
  disabled?: boolean | undefined;
}

const Radiobox = ({ label, ...props }: RadioboxProps) => {
  return (
    <label className={styles.label}>
      <input type="radio" className={styles.input} {...props} />
      {label}
    </label>
  );
};

export { Radiobox };
