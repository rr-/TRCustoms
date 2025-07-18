import "./forms.css";
import "./index.css";
import "./themes.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "react-query";
import { QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import App from "src/components/App";
import { ScrollToTop } from "src/components/common/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <QueryClientProvider client={queryClient} contextSharing={true}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
