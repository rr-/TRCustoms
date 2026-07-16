import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "src/components/forms/serverErrors";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

// Reading formState.errors during render subscribes the hook so setError
// triggers a re-render and renderHook's snapshot stays current.
const useTestForm = () => {
  const form = useForm({ defaultValues: { name: "", email: "" } });
  return { form, errors: form.formState.errors };
};

describe("applyServerErrors", () => {
  test("maps a field error onto the matching field", () => {
    const { result } = renderHook(useTestForm);

    let applied = false;
    act(() => {
      applied = applyServerErrors(result.current.form, {
        name: ["Already taken"],
      });
    });

    expect(applied).toBe(true);
    expect(result.current.errors.name?.message).toBe("Already taken");
  });

  test("unwraps the first message from an array", () => {
    const { result } = renderHook(useTestForm);

    act(() => {
      applyServerErrors(result.current.form, { email: ["First", "Second"] });
    });

    expect(result.current.errors.email?.message).toBe("First");
  });

  test("skips non-field keys and unknown fields", () => {
    const { result } = renderHook(useTestForm);

    let applied = false;
    act(() => {
      applied = applyServerErrors(result.current.form, {
        detail: ["A general problem"],
        non_field_errors: ["Another"],
        unknown_field: ["Nope"],
      });
    });

    expect(applied).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  test("ignores empty messages", () => {
    const { result } = renderHook(useTestForm);

    let applied = false;
    act(() => {
      applied = applyServerErrors(result.current.form, { name: [] });
    });

    expect(applied).toBe(false);
    expect(result.current.errors.name).toBeUndefined();
  });
});
