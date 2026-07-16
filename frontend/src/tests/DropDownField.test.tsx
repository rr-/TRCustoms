import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "react-hook-form";
import { useForm } from "react-hook-form";
import { DropDownField } from "src/components/forms/fields/DropDownField";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";

// Render the current form value with its runtime type so the test can assert
// that a numeric option id round-trips as a number (a <select> emits strings).
const Harness = () => {
  const form = useForm();
  const value = form.watch("engine_id");
  return (
    <FormProvider {...form}>
      <DropDownField
        name="engine_id"
        label="Engine"
        options={[
          { value: 1, label: "TR1" },
          { value: 2, label: "TR2" },
        ]}
      />
      <output data-testid="value">{`${typeof value}:${JSON.stringify(value)}`}</output>
    </FormProvider>
  );
};

describe("DropDownField", () => {
  test("emits the numeric option value, not the DOM string", async () => {
    render(<Harness />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "2");

    // Without the coercion this would be the string "2" and LevelForm's
    // z.number() schema would reject it, blocking submit.
    expect(screen.getByTestId("value")).toHaveTextContent("number:2");
  });
});
