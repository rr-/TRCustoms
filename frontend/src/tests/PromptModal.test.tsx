import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PromptModal } from "src/components/modals/PromptModal";
import { afterEach } from "vitest";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const renderModal = (onConfirm = vi.fn(), onIsActiveChange = vi.fn()) => {
  render(
    <MemoryRouter>
      <PromptModal
        isActive={true}
        onIsActiveChange={onIsActiveChange}
        onConfirm={onConfirm}
        label="Reason"
      >
        Are you sure?
      </PromptModal>
    </MemoryRouter>,
  );
  return { onConfirm, onIsActiveChange };
};

describe("PromptModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // BaseModal portals into #root, which the test document lacks.
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.getElementById("root")?.remove();
  });

  test("confirms with the entered text and closes", async () => {
    const { onConfirm, onIsActiveChange } = renderModal();

    await userEvent.type(screen.getByRole("textbox"), "spam");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("spam"));
    expect(onIsActiveChange).toHaveBeenCalledWith(false);
  });

  test("does not confirm when the text is empty", async () => {
    const { onConfirm } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
