import { get } from "lodash";
import { useFormContext } from "react-hook-form";

interface FieldErrorProps {
  name: string;
}

// Renders the react-hook-form error for a single field. `get` handles nested
// field paths (e.g. "links.0.url").
const FieldError = ({ name }: FieldErrorProps) => {
  const {
    formState: { errors },
  } = useFormContext();
  const message = get(errors, name)?.message;
  return message ? (
    <div className="FormFieldError">{String(message)}</div>
  ) : null;
};

export { FieldError };
