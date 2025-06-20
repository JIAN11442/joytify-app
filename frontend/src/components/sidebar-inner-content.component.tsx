import { useLocation } from "react-router-dom";
import ManageSidebar from "./manage-sidebar.component";
import LibrarySidebar from "./library-sidebar.component";
import SettingsSidebar from "./settings-sidebar.component";

const SidebarInnerContent = () => {
  const location = useLocation();

  // map routes to their corresponding sidebar components
  const routeToSidebar = {
    "/settings": SettingsSidebar,
    "/manage": ManageSidebar,
    "/": LibrarySidebar,
  };

  // find the matching route and render the corresponding sidebar
  const SidebarComponent =
    Object.entries(routeToSidebar).find(([route]) => location.pathname.startsWith(route))?.[1] ||
    LibrarySidebar;

  return <SidebarComponent />;
};

export default SidebarInnerContent;
