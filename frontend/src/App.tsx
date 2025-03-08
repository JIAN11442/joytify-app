import { Route, Routes, useNavigate } from "react-router-dom";

import HomePage from "./pages/home.page";
import ResetPasswordPage from "./pages/reset-password.page";
import AppContainerPage from "./pages/app-container.page";
import PlaylistPage from "./pages/playlist.page";
import SearchPage from "./pages/search.page";

import Sidebar from "./components/sidebar.component";

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
        </Route>
      </Route>

      <Route path="/password/reset" element={<ResetPasswordPage />} />
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}

export default App;
