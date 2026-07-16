import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { LevelForm } from "src/components/forms/LevelForm";
import { UserContext } from "src/contexts/UserContext";
import { LevelService } from "src/services/LevelService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user: null, setUser: vi.fn() }}>
        <MemoryRouter>{children}</MemoryRouter>
      </UserContext.Provider>
    </QueryClientProvider>
  );
};

describe("LevelForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the create form", () => {
    render(<LevelForm />, { wrapper });
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("blocks submit and shows required errors when empty", async () => {
    const create = vi.spyOn(LevelService, "create");
    render(<LevelForm />, { wrapper });

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      (await screen.findAllByText(/This field is required/)).length,
    ).toBeGreaterThan(0);
    expect(create).not.toHaveBeenCalled();
  });
});
