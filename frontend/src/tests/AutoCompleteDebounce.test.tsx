import { AutoComplete } from "../components/common/AutoComplete";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

// AutoComplete used to call onSearchTrigger straight from a useEffect on
// textInput, so typing "sabatuy" issued seven level searches - each one an
// unindexable LIKE across seven columns.
const renderAutoComplete = (onSearchTrigger: (text: string) => void) =>
  render(
    <AutoComplete
      suggestions={[]}
      getResultText={(item: string) => item}
      getResultKey={(item: string) => item}
      onSearchTrigger={onSearchTrigger}
      onResultApply={() => {}}
    />,
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

test("autocomplete issues one search for a burst of keystrokes", async () => {
  const onSearchTrigger = vi.fn();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  renderAutoComplete(onSearchTrigger);
  onSearchTrigger.mockClear();

  await user.type(screen.getByRole("textbox"), "sabatuy");
  expect(onSearchTrigger).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(300);

  expect(onSearchTrigger).toHaveBeenCalledTimes(1);
  expect(onSearchTrigger).toHaveBeenCalledWith("sabatuy");
});
