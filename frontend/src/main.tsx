import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.tsx";
import "../index.css";

import Loader from "./components/loader.component.tsx";
import ModalProvider from "./providers/modal.provider.tsx";
import ToasterProvider from "./providers/toaster.provider.tsx";
import ScreenMonitorProvider from "./providers/screen.provider.tsx";
import ShortcutKeysProvider from "./providers/shortcut-keys.provider.tsx";
import UserPreferencesProvider from "./providers/user-preferences.provider.tsx";

import queryClient from "./config/query-client.config.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <ScreenMonitorProvider>
            <ShortcutKeysProvider>
              <ToasterProvider />
              <ModalProvider />
              <ReactQueryDevtools initialIsOpen={false} />
              <UserPreferencesProvider />
              <App />
            </ShortcutKeysProvider>
          </ScreenMonitorProvider>
        </BrowserRouter>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);
