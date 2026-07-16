import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import type { UserDetails } from "src/services/UserService";
import { useUser } from "src/stores/user";

interface RenderRouteOptions {
  // The route pattern (e.g. "/levels/:levelId/walkthrough") and the concrete
  // entry to visit, so useParams resolves exactly as it does in the app.
  path: string;
  entry: string;
  // Tests supply only the fields the component reads.
  user?: Partial<UserDetails> | null;
}

// Render a page component inside the providers it expects: a retry-free query
// client and a router matching the given route so useParams works for real.
// The logged-in user lives in the zustand store (reset between tests), so seed
// it directly instead of wrapping a provider.
const renderRoute = (ui: ReactElement, options: RenderRouteOptions) => {
  const { path, entry, user = null } = options;
  useUser.setState({ user: user as UserDetails | null });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

export { renderRoute };
