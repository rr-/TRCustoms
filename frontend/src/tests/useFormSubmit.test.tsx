import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { FormSuccess } from "src/components/forms/useFormSubmit";
import type { ServerErrorMapper } from "src/components/forms/useFormSubmit";
import { useFormSubmit } from "src/components/forms/useFormSubmit";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

type Values = { name: string };

const useHarness = (
  handler: (values: Values) => Promise<FormSuccess | void>,
  mapper?: ServerErrorMapper<Values>,
) => {
  const form = useForm<Values>({ defaultValues: { name: "" } });
  // Read errors during render so setError re-renders the hook (RHF's formState
  // is a lazy proxy that only tracks what was read).
  return {
    form,
    errors: form.formState.errors,
    ...useFormSubmit(form, handler, mapper),
  };
};

describe("useFormSubmit", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  test("stores the success state the handler returns", async () => {
    const { result } = renderHook(() =>
      useHarness(async () => ({ success: "Saved", final: true })),
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.result).toEqual({ success: "Saved", final: true });
  });

  test("maps a thrown field error onto the field and shows no banner", async () => {
    const { result } = renderHook(() =>
      useHarness(async () => {
        throw { name: ["Already taken"] };
      }),
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.result).toEqual({});
    expect(result.current.errors.name?.message).toBe("Already taken");
  });

  test("surfaces a non-field error as a banner message", async () => {
    const { result } = renderHook(() =>
      useHarness(async () => {
        throw { detail: "Something broke" };
      }),
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.result?.error).toBe("Something broke");
    expect(result.current.errors.name).toBeUndefined();
  });

  test("uses a custom server-error mapper when provided", async () => {
    const mapper: ServerErrorMapper<Values> = (
      form: UseFormReturn<Values>,
      body,
    ) => {
      if (body.custom_key) {
        form.setError("name", { message: String(body.custom_key) });
        return true;
      }
      return false;
    };

    const { result } = renderHook(() =>
      useHarness(async () => {
        throw { custom_key: "Mapped message" };
      }, mapper),
    );

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.result).toEqual({});
    expect(result.current.errors.name?.message).toBe("Mapped message");
  });
});
