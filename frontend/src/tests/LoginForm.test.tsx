import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { LoginForm } from "src/components/forms/LoginForm";
import { AuthService } from "src/services/AuthService";
import { UserService } from "src/services/UserService";
import { useUser } from "src/stores/user";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const submitLogin = async () => {
  await userEvent.type(screen.getByLabelText(/Username/), "tester");
  await userEvent.type(screen.getByLabelText(/Password/), "hunter2000");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
};

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders a Log in button", () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  test("logs in, stores the user, and calls onLogin", async () => {
    const login = vi.spyOn(AuthService, "login").mockResolvedValue();
    vi.spyOn(UserService, "getCurrentUser").mockResolvedValue({
      id: 1,
    } as Awaited<ReturnType<typeof UserService.getCurrentUser>>);
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />, { wrapper });

    await submitLogin();

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith("tester", "hunter2000"),
    );
    await waitFor(() => expect(useUser.getState().user).toEqual({ id: 1 }));
    expect(onLogin).toHaveBeenCalled();
  });

  test("shows the error detail on failed login", async () => {
    vi.spyOn(AuthService, "login").mockRejectedValue({
      detail: "invalid credentials",
    });
    render(<LoginForm />, { wrapper });

    await submitLogin();

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("offers to resend activation when the email is unconfirmed", async () => {
    vi.spyOn(AuthService, "login").mockRejectedValue({
      code: "email_not_confirmed",
      detail: "your email is not confirmed",
    });
    render(<LoginForm />, { wrapper });

    await submitLogin();

    expect(
      await screen.findByText(/Resend activation email/i),
    ).toBeInTheDocument();
  });
});
