import styles from "./index.module.css";

interface DropdownOption {
  value: string | number;
  label: string;
}

type DropdownValue<Multiple extends boolean> = Multiple extends true
  ? string[]
  : string;

interface DropdownProps<Multiple extends boolean = false> {
  className?: string;
  nullLabel?: string;
  value: string | number;
  onChange: (value: DropdownValue<Multiple>) => void;
  options: DropdownOption[];
  allowNull?: boolean | undefined;
  multiple?: Multiple | undefined;
  readonly?: boolean | undefined;
}

const Dropdown = <Multiple extends boolean = false>({
  className,
  nullLabel,
  options,
  value,
  onChange,
  multiple,
  allowNull,
  readonly,
}: DropdownProps<Multiple>) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = multiple
      ? Array.from(event.target.selectedOptions).map((option) => option.value)
      : (event.target.selectedOptions?.[0].value ?? "");
    onChange(selected as DropdownValue<Multiple>);
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
