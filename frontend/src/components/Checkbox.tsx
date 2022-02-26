import "./Checkbox.css";

interface CheckboxProps {
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  checked: boolean;
}

const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <label className="Checkbox--label">
      <input type="checkbox" className="Checkbox--input" {...props} />
      {label}
    </label>
  );
};

export { Checkbox };
