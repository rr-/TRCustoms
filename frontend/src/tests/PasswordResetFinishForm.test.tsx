import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { PasswordResetFinishForm } from "src/components/forms/PasswordResetFinishForm";
import { UserService } from "src/services/UserService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("PasswordResetFinishForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("rejects mismatched passwords", async () => {
    render(<PasswordResetFinishForm token="abc" />, { wrapper });

    await userEvent.type(screen.getByLabelText(/^Password\*/), "password123");
    await userEvent.type(screen.getByLabelText(/repeat/i), "different123");
    await userEvent.click(
      screen.getByRole("button", { name: "Reset password" }),
    );

    expect(
      await screen.findByText(/Passwords do not match/),
    ).toBeInTheDocument();
  });

  test("completes the reset with the token and shows a login link", async () => {
    const complete = vi
      .spyOn(UserService, "completePasswordReset")
      .mockResolvedValue();
    render(<PasswordResetFinishForm token="reset-token" />, { wrapper });

    await userEvent.type(screen.getByLabelText(/^Password\*/), "password123");
    await userEvent.type(screen.getByLabelText(/repeat/i), "password123");
    await userEvent.click(
      screen.getByRole("button", { name: "Reset password" }),
    );

    await waitFor(() =>
      expect(complete).toHaveBeenCalledWith("password123", "reset-token"),
    );
    expect(
      await screen.findByRole("link", { name: /log in/i }),
    ).toBeInTheDocument();
  });
});
