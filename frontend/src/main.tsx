import "./forms.css";
import "./index.css";
import "./themes.css";
import {
  QueryClient as QueryClientV5,
  QueryClientProvider as QueryClientProviderV5,
} from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "react-query";
import { QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { configureApiClient } from "src/apiClient";
import App from "src/components/App";
import { ScrollToTop } from "src/components/common/ScrollToTop";

configureApiClient();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

// The generated API hooks use TanStack Query v5. During the migration off the
// hand-written services it runs nested inside the legacy react-query v3
// provider; the v3 provider is removed once every call site has moved over.
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
});

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient} contextSharing={true}>
        <QueryClientProviderV5 client={queryClientV5}>
          <App />
        </QueryClientProviderV5>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
