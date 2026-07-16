import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { UserContext } from "src/contexts/UserContext";

interface RenderRouteOptions {
  // The route pattern (e.g. "/levels/:levelId/walkthrough") and the concrete
  // entry to visit, so useParams resolves exactly as it does in the app.
  path: string;
  entry: string;
  user?: unknown;
}

// Render a page component inside the providers it expects: a retry-free query
// client, a user context (whose default is null and would otherwise crash), and
// a router matching the given route so useParams works for real.
const renderRoute = (ui: ReactElement, options: RenderRouteOptions) => {
  const { path, entry, user = null } = options;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={{ user, setUser: () => {} }}>
        <MemoryRouter initialEntries={[entry]}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </MemoryRouter>
      </UserContext.Provider>
    </QueryClientProvider>,
  );
};

export { renderRoute };
