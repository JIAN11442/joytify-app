import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/sidebar.component";
import HomePage from "./home.page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sidebar />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
