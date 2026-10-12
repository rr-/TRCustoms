import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { UserLink } from "src/components/links/UserLink";
import { AdministrationPage } from "src/components/pages/AdministrationPage";
import { UserPage } from "src/components/pages/UserPage";
import { defaultConfig } from "src/stores/config";
import { useConfig } from "src/stores/config";
import { useUser } from "src/stores/user";
import { renderRoute } from "src/tests/renderRoute";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const administrator = { id: 99, username: "Administration", picture: null };

describe("AdministrationPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useConfig.setState({
      config: {
        ...defaultConfig,
        administrator:
          administrator as unknown as typeof defaultConfig.administrator,
      },
    });
  });

  test("explains the account and offers a message", () => {
    renderRoute(<AdministrationPage />, {
      path: "/administration",
      entry: "/administration",
      user: { id: 1, username: "tester", permissions: [] },
    });

    expect(screen.getByText(/utilized by multiple/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send message" })).toHaveAttribute(
      "href",
      "/users/99/message",
    );
  });

  test("points visitors without an account to email", () => {
    renderRoute(<AdministrationPage />, {
      path: "/administration",
      entry: "/administration",
      user: null,
    });

    expect(
      screen.queryByRole("link", { name: "Send message" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "admin@trcustoms.org" }),
    ).toBeInTheDocument();
  });

  test("links the account to its page", () => {
    renderRoute(<UserLink user={administrator} />, {
      path: "/",
      entry: "/",
      user: { id: 1, username: "tester", permissions: ["view_users"] },
    });

    expect(
      screen.getByRole("link", { name: "Administration" }),
    ).toHaveAttribute("href", "/administration");
  });

  test("redirects the account's profile", async () => {
    useUser.setState({ user: null });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/users/99"]}>
          <Routes>
            <Route path="/users/:userId" element={<UserPage />} />
            <Route path="/administration" element={<AdministrationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/utilized by multiple/)).toBeInTheDocument();
  });
});
