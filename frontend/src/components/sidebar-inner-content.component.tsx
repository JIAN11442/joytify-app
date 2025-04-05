import { useLocation } from "react-router-dom";
import LibrarySidebar from "./library-sidebar.component";
import SettingsSidebar from "./settings-sidebar.component";

const SidebarInnerContent = () => {
  const location = useLocation();

  return location.pathname.startsWith("/settings") ? <SettingsSidebar /> : <LibrarySidebar />;
};

export default SidebarInnerContent;
