import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaylistLevelSearch } from "src/components/common/PlaylistLevelSearch";
import { LevelService } from "src/services/LevelService";
import { PlaylistService } from "src/services/PlaylistService";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const applyFirstSuggestion = async () => {
  await userEvent.type(screen.getByRole("textbox"), "Temple");
  await userEvent.click(await screen.findByText("Temple"));
};

describe("PlaylistLevelSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(LevelService, "searchLevels").mockResolvedValue({
      results: [{ id: 5, name: "Temple" }],
    } as any);
  });

  test("adds the selected level to the playlist", async () => {
    const create = vi
      .spyOn(PlaylistService, "create")
      .mockResolvedValue({} as any);
    const onAdd = vi.fn();
    render(<PlaylistLevelSearch userId={7} onAdd={onAdd} />);

    await applyFirstSuggestion();

    await waitFor(() =>
      expect(create).toHaveBeenCalledWith(7, {
        levelId: 5,
        status: expect.any(String),
      }),
    );
    expect(onAdd).toHaveBeenCalled();
  });

  // The generated client rejects with the parsed body, so the duplicate marker
  // is at error.code, not error.response.data.code as it was with axios.
  test("warns when the level is already on the playlist", async () => {
    vi.spyOn(PlaylistService, "create").mockRejectedValue({
      code: "duplicate_level",
    });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<PlaylistLevelSearch userId={7} />);

    await applyFirstSuggestion();

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "This level was already added to the playlist.",
      ),
    );
  });

  test("shows a generic error on other failures", async () => {
    vi.spyOn(PlaylistService, "create").mockRejectedValue({ detail: "nope" });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<PlaylistLevelSearch userId={7} />);

    await applyFirstSuggestion();

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to add the level to the playlist.",
      ),
    );
  });
});
