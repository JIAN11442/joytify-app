import { Route, Routes, useNavigate } from "react-router-dom";

import Sidebar from "./components/sidebar.component";

import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile.page";
import SettingsPage from "./pages/settings.page";
import PlaylistPage from "./pages/playlist.page";
import AppContainerPage from "./pages/app-container.page";
import ResetPasswordPage from "./pages/reset-password.page";
import ProfileSectionPage from "./pages/profile-section.page";
import SettingsAccountPage from "./pages/settings-account.page";
import AccountDeregistrationPolicyPage from "./pages/account-deregistration-policy.page";
import { setNavigate } from "./lib/navigate.lib";

function App() {
  // original navigate function can't be using outside of the component
  // so we need to set it to the global scope
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* need login to access */}
        <Route element={<AppContainerPage />}>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/:id/:section" element={<ProfileSectionPage />} />
          <Route path="/settings">
            <Route index element={<SettingsPage />} />
            <Route path="/settings/account" element={<SettingsAccountPage />} />
            <Route path="/settings/notifications" element={<p>Notifications</p>} />
          </Route>
        </Route>
      </Route>

      <Route path="/password/reset" element={<ResetPasswordPage />} />
      <Route
        path="/policies/account-deregistration"
        element={<AccountDeregistrationPolicyPage />}
      />
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}

export default App;
