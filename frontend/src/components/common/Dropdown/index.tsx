import styles from "./index.module.css";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  className?: string;
  nullLabel?: string;
  value: string | number;
  onChange: (value: any) => any;
  options: DropdownOption[];
  allowNull?: boolean | undefined;
  multiple?: boolean | undefined;
  readonly?: boolean | undefined;
}

const Dropdown = ({
  className,
  nullLabel,
  options,
  value,
  onChange,
  multiple,
  allowNull,
  readonly,
  ...props
}: DropdownProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(
      multiple
        ? [].slice
            .call(event.target.selectedOptions)
            .map((option: HTMLOptionElement) => option.value)
        : event.target.selectedOptions?.[0].value
    );
  };

  if (allowNull === undefined) {
    allowNull = false;
  }

  return (
    <select
      disabled={readonly}
      placeholder="Select a value…"
      multiple={multiple}
      className={`Input ${styles.select} ${className || ""}`}
      onChange={handleChange}
      value={value}
    >
      {!multiple && (
        <option disabled={!allowNull} value={""}>
          {nullLabel || "Select an option…"}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export type { DropdownOption, DropdownProps };
export { Dropdown };
