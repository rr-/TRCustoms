import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { LevelForm } from "src/components/forms/LevelForm";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import { defaultConfig } from "src/stores/config";
import { useConfig } from "src/stores/config";
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
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

const makeLevel = (releaseDate: string) =>
  ({
    id: 1,
    name: "Test level",
    genres: [],
    tags: [],
    authors: [],
    screenshots: [],
    external_links: [],
    release_date: releaseDate,
  }) as unknown as LevelDetails;

describe("LevelForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useConfig.setState({
      config: {
        ...defaultConfig,
        server_date: "2026-10-12",
        limits: { ...defaultConfig.limits, max_release_delay_days: 7 },
      },
      refetchConfig: vi.fn(),
    });
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

  test("offers release dates up to the delay limit", () => {
    render(<LevelForm />, { wrapper });

    const select = screen.getByLabelText(/Release date/) as HTMLSelectElement;
    const values = Array.from(select.options, (option) => option.value);
    expect(values.filter(Boolean)).toEqual([
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
      "2026-10-19",
    ]);
    expect(select.options[1].textContent).toBe("Today, once approved");
    expect(select.value).toBe("2026-10-12");
  });

  test("keeps a scheduled level's release date editable", () => {
    const level = makeLevel("2026-10-15");
    render(<LevelForm level={level} />, { wrapper });

    const select = screen.getByLabelText(/Release date/) as HTMLSelectElement;
    expect(select.value).toBe("2026-10-15");
  });

  test("hides the release date once the level is out", () => {
    const level = makeLevel("2026-10-01");
    render(<LevelForm level={level} />, { wrapper });

    expect(screen.queryByLabelText(/Release date/)).not.toBeInTheDocument();
  });
});
