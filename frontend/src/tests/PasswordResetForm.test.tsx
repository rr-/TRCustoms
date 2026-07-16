import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordResetForm } from "src/components/forms/PasswordResetForm";
import { UserService } from "src/services/UserService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

describe("PasswordResetForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("requires a valid e-mail", async () => {
    const request = vi.spyOn(UserService, "requestPasswordReset");
    render(<PasswordResetForm />);

    await userEvent.click(
      screen.getByRole("button", { name: "Reset password" }),
    );

    expect(await screen.findByText(/required/i)).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  test("requests the reset and shows the confirmation", async () => {
    const request = vi
      .spyOn(UserService, "requestPasswordReset")
      .mockResolvedValue();
    render(<PasswordResetForm />);

    await userEvent.type(screen.getByLabelText(/E-mail/), "me@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "Reset password" }),
    );

    await waitFor(() => expect(request).toHaveBeenCalledWith("me@example.com"));
    expect(
      await screen.findByText(/further instructions will be sent/i),
    ).toBeInTheDocument();
  });
});
