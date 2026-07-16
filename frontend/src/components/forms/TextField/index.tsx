import { useFormContext } from "react-hook-form";
import { BaseField } from "src/components/forms/BaseField";
import type { BaseFieldProps } from "src/components/forms/BaseField";

interface TextFieldProps extends Omit<BaseFieldProps, "children"> {
  readonly?: boolean | undefined;
  type?: string | undefined;
}

// react-hook-form port of TextFormField: a single-line text input bound to the
// form by register(). Reuses the existing global input styles.
const TextField = ({ name, readonly, type, ...baseProps }: TextFieldProps) => {
  const { register } = useFormContext();
  return (
    <BaseField name={name} {...baseProps}>
      <input
        id={name}
        {...register(name)}
        disabled={readonly}
        className="TextFormField--input Input"
        type={type || "text"}
      />
    </BaseField>
  );
};

export type { TextFieldProps };
export { TextField };
