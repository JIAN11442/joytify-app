import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";
import "../index.css";

import queryClient from "./config/query-client.config.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ScreenMonitor from "./providers/screen.provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScreenMonitor>
          <ReactQueryDevtools initialIsOpen={false} />
          <App />
        </ScreenMonitor>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
