import "./index.css";

interface CheckboxProps {
  label: string | React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  checked: boolean;
  disabled?: boolean | undefined;
}

const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <div className="Checkbox">
      <label className="Checkbox--label">
        <input type="checkbox" className="Checkbox--input" {...props} />
        {label}
      </label>
    </div>
  );
};

export { Checkbox };
