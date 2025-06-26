import { Route, Routes, useNavigate } from "react-router-dom";

import Sidebar from "./components/sidebar.component";
import DeregistrationIntlProvider from "./providers/deregistration-intl.provider";

import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile.page";
import PlaylistPage from "./pages/playlist.page";
import ResetPasswordPage from "./pages/reset-password.page";
import ProfileSectionPage from "./pages/profile-section.page";
import SettingsAccountPage from "./pages/settings-account.page";
import SettingsLanguagesPage from "./pages/settings-languages.page";
import AuthGuardContainerPage from "./pages/auth-guard-container.page";
import AccountDeregistrationPolicyPage from "./pages/account-deregistration-policy.page";
import SettingsNotificationsPage from "./pages/settings-notifications.page";
import { setNavigate } from "./lib/navigate.lib";
import SettingsConnectedDevicesPage from "./pages/settings-connected-devices.page";
import ManageSongsPage from "./pages/manage-songs.page";
import ManagePlaylistsPage from "./pages/manage-playlists.page";

function App() {
  // original navigate function can't be using outside of the component
  // so we need to set it to the global scope
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />

        {/* Private pages(need login) */}
        <Route element={<AuthGuardContainerPage />}>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/:id/:section" element={<ProfileSectionPage />} />
          <Route path="/settings">
            <Route path="account" element={<SettingsAccountPage />} />
            <Route path="notifications" element={<SettingsNotificationsPage />} />
            <Route path="languages" element={<SettingsLanguagesPage />} />
            <Route path="connected-devices" element={<SettingsConnectedDevicesPage />} />
          </Route>
          <Route path="/manage">
            <Route path="songs" element={<ManageSongsPage />} />
            <Route path="playlists" element={<ManagePlaylistsPage />} />
            <Route path="following" element={<p>following artists management</p>} />
            <Route path="notifications" element={<p>notifications management</p>} />
          </Route>
        </Route>
      </Route>

      {/* Public pages(no need login) */}
      <Route element={<AuthGuardContainerPage redirectToHomeOnUnauthorized={false} />}>
        <Route path="/password/reset" element={<ResetPasswordPage />} />
        <Route
          path="/policies/account-deregistration"
          element={
            // use its own IntlProvider to avoid inheriting the theme IntlProvider.
            // the intl hook (useIntl) will always get the nearest IntlProvider in the React tree.
            // this allows AccountDeregistrationPolicyPage to have an independent locale/messages setting,
            // regardless of the global or theme-level IntlProvider.
            <DeregistrationIntlProvider>
              <AccountDeregistrationPolicyPage />
            </DeregistrationIntlProvider>
          }
        />
      </Route>

      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}

export default App;
