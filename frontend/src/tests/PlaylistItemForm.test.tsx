import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { PlaylistItemForm } from "src/components/common/PlaylistItemForm";
import { PlaylistItemStatus } from "src/services/PlaylistService";
import { PlaylistService } from "src/services/PlaylistService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const level = { id: 50, name: "Catacombs" } as any;

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const renderForm = () =>
  render(<PlaylistItemForm userId={7} level={level} />, { wrapper });

describe("PlaylistItemForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // The level is not on the playlist yet, so the lookup 404s and the form
    // renders in create mode.
    vi.spyOn(PlaylistService, "get").mockRejectedValue(new Error("not found"));
  });

  test("renders in create mode with a Save button", async () => {
    renderForm();
    expect(
      await screen.findByRole("button", { name: "Save" }),
    ).toBeInTheDocument();
  });

  test("requires a status", async () => {
    const create = vi.spyOn(PlaylistService, "create");
    renderForm();

    await userEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(await screen.findByText("Status is required")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  test("submits the selected status", async () => {
    const create = vi
      .spyOn(PlaylistService, "create")
      .mockResolvedValue({} as any);
    renderForm();

    const save = await screen.findByRole("button", { name: "Save" });
    await userEvent.selectOptions(
      screen.getByLabelText(/Status/),
      PlaylistItemStatus.Finished,
    );
    await userEvent.click(save);

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(7, {
        levelId: 50,
        status: PlaylistItemStatus.Finished,
      }),
    );
    expect(await screen.findByText("Click here")).toBeInTheDocument();
  });
});
