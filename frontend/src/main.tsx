import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.tsx";
import ModalProvider from "./providers/modal.provider.tsx";
import ToasterProvider from "./providers/toaster.provider.tsx";
import ScreenMonitorProvider from "./providers/screen.provider.tsx";
import ShortcutKeysProvider from "./providers/shortcut-keys.provider.tsx";
import UserPreferencesProvider from "./providers/user-preferences.provider.tsx";
import SkeletonThemeProvider from "./providers/skeleton-theme.provider.tsx";
import ThemeIntlProvider from "./providers/theme-intl.provider.tsx";
import queryClient from "./config/query-client.config.ts";
import "../index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <BrowserRouter>
          <ThemeIntlProvider>
            <ScreenMonitorProvider>
              <ShortcutKeysProvider>
                <ToasterProvider />
                <ModalProvider />
                <ReactQueryDevtools initialIsOpen={false} />
                <UserPreferencesProvider />
                <SkeletonThemeProvider>
                  <App />
                </SkeletonThemeProvider>
              </ShortcutKeysProvider>
            </ScreenMonitorProvider>
          </ThemeIntlProvider>
        </BrowserRouter>
      </Suspense>
    </QueryClientProvider>
  </StrictMode>
);
