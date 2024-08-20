import { Route, Routes, useNavigate } from "react-router-dom";

import Sidebar from "./components/sidebar.component";
import HomePage from "./pages/home.page";
import ForgotPasswordPage from "./pages/forgot-password.page";
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
        <Route path="/auth/password/forgot" element={<ForgotPasswordPage />} />
      </Route>
    </Routes>
  );
}

export default App;
