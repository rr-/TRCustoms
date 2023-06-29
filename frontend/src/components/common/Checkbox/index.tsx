import styles from "./index.module.css";

interface CheckboxProps {
  label: string | React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  checked: boolean;
  disabled?: boolean | undefined;
}

const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <div>
      <label className={styles.label}>
        <input type="checkbox" className={styles.input} {...props} />
        {label}
      </label>
    </div>
  );
};

export { Checkbox };
