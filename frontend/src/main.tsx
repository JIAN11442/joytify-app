import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.tsx";
import "../index.css";

import ScreenMonitor from "./providers/screen.provider.tsx";
import ModalProvider from "./providers/modal.provider.tsx";

import queryClient from "./config/query-client.config.ts";
import ToasterProvider from "./providers/toaster.provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToasterProvider>
          <ScreenMonitor>
            <ModalProvider />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            <App />
          </ScreenMonitor>
        </ToasterProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
