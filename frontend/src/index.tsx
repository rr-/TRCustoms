import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "src/shared/ScrollToTop";
import { ThemeManager } from "src/shared/components/ThemeManager";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeManager />
    <BrowserRouter>
      <QueryClientProvider client={queryClient} contextSharing={true}>
        <ScrollToTop>
          <App />
        </ScrollToTop>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
