import "./index.css";
import { Controller } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { BaseField } from "src/components/forms/fields/BaseField";
import type { BaseFieldProps } from "src/components/forms/fields/BaseField";

interface DropDownOption {
  value: string | number;
  label: string;
}

interface DropDownFieldProps extends Omit<BaseFieldProps, "children"> {
  options: DropDownOption[];
  readonly?: boolean | undefined;
  allowNull?: boolean | undefined;
  nullLabel?: string | undefined;
  multiple?: boolean | undefined;
  onChange?: (() => void) | undefined;
}

// react-hook-form port of DropDownFormField: a bound <select>. A Controller
// keeps the value controlled so both single and multi selection round-trip
// cleanly (multi produces an array of the selected option values).
const DropDownField = ({
  name,
  options,
  readonly,
  allowNull = false,
  nullLabel = "Select an option…",
  multiple,
  onChange,
  ...baseProps
}: DropDownFieldProps) => {
  const { control } = useFormContext();
  // A <select> always yields string values from the DOM, so map each selection
  // back to its declared option value to preserve numeric ids (schemas expect
  // z.number() for engine/difficulty/duration). Unmatched values — e.g. the
  // empty "null" option — pass through unchanged.
  const toOptionValue = (raw: string): string | number =>
    options.find((option) => String(option.value) === raw)?.value ?? raw;
  return (
    <BaseField name={name} {...baseProps}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select
            id={name}
            ref={field.ref}
            name={field.name}
            disabled={readonly}
            multiple={multiple}
            className="DropDownFormField--select Input"
            value={multiple ? (field.value ?? []) : (field.value ?? "")}
            onBlur={field.onBlur}
            onChange={(event) => {
              field.onChange(
                multiple
                  ? Array.from(event.target.selectedOptions, (option) =>
                      toOptionValue(option.value),
                    )
                  : toOptionValue(event.target.value),
              );
              onChange?.();
            }}
          >
            {!multiple && (
              <option disabled={!allowNull} value="">
                {nullLabel}
              </option>
            )}
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
      />
    </BaseField>
  );
};

export type { DropDownOption, DropDownFieldProps };
export { DropDownField };
