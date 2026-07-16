import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { UserForm } from "src/components/common/UserForm";
import { UserContext } from "src/contexts/UserContext";
import { UserService } from "src/services/UserService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const wrapper = ({ children }: { children: ReactNode }) => (
  <UserContext.Provider value={{ user: null, setUser: vi.fn() }}>
    <MemoryRouter>{children}</MemoryRouter>
  </UserContext.Provider>
);

const renderForm = (onSubmit = vi.fn()) =>
  render(<UserForm onSubmit={onSubmit} />, { wrapper });

const fillValid = async () => {
  await userEvent.type(screen.getByLabelText(/Username/), "tester");
  await userEvent.type(screen.getByLabelText(/E-mail/), "new@example.com");
  await userEvent.type(screen.getByLabelText(/^Password\*/), "password123");
  await userEvent.type(screen.getByLabelText(/repeat/i), "password123");
};

describe("UserForm (registration)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders a Register button", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
  });

  test("requires username and password", async () => {
    const register = vi.spyOn(UserService, "register");
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      (await screen.findAllByText(/This field is required/)).length,
    ).toBeGreaterThan(1);
    expect(register).not.toHaveBeenCalled();
  });

  test("rejects mismatched passwords", async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText(/Username/), "tester");
    await userEvent.type(screen.getByLabelText(/E-mail/), "new@example.com");
    await userEvent.type(screen.getByLabelText(/^Password\*/), "password123");
    await userEvent.type(screen.getByLabelText(/repeat/i), "different123");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText(/Passwords do not match/),
    ).toBeInTheDocument();
  });

  test("registers with the entered values", async () => {
    const register = vi
      .spyOn(UserService, "register")
      .mockResolvedValue({ id: 1 } as any);
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "tester",
          email: "new@example.com",
          password: "password123",
        }),
      ),
    );
    expect(onSubmit).toHaveBeenCalled();
  });

  test("maps a server field error onto the username", async () => {
    vi.spyOn(UserService, "register").mockRejectedValue({
      username: ["Username already taken"],
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderForm();

    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText(/Username already taken/),
    ).toBeInTheDocument();
  });
});
