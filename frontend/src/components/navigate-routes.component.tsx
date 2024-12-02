import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import useSidebarState from "../states/sidebar.state";

const NavigateRoutes = () => {
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <ContentBox
      className={`
        h-auto
        p-2
      `}
    >
      <div
        className={`
          flex
          flex-col
          py-5
          px-3
          gap-y-4
        `}
      >
        <SidebarItem
          href="/"
          icon={{ name: HiHome }}
          label="Home"
          collapse={isCollapsed}
        />
        <SidebarItem
          href="/search"
          icon={{ name: BiSearch }}
          label="Search"
          collapse={isCollapsed}
        />
      </div>
    </ContentBox>
  );
};

export default NavigateRoutes;
