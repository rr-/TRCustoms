import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Map a DRF-style error body ({ field: ["msg"], detail: "msg" }) onto the
// form's own fields so a server-side validation error renders inline under the
// input that caused it, exactly like a client-side one. Returns true when at
// least one field-level error was applied so the caller can decide whether a
// separate banner is still needed.
const NON_FIELD_KEYS = ["detail", "non_field_errors", "__all__"];

const firstMessage = (value: unknown): string => {
  if (Array.isArray(value)) {
    return firstMessage(value[0]);
  }
  return value == null ? "" : String(value);
};

const applyServerErrors = <T extends FieldValues>(
  form: UseFormReturn<T>,
  body: Record<string, unknown>,
): boolean => {
  const known = new Set(Object.keys(form.getValues()));
  let appliedField = false;
  for (const [key, value] of Object.entries(body)) {
    const message = firstMessage(value);
    if (!message || NON_FIELD_KEYS.includes(key)) {
      continue;
    }
    if (known.has(key)) {
      form.setError(key as Path<T>, { type: "server", message });
      appliedField = true;
    }
  }
  return appliedField;
};

export { applyServerErrors };
