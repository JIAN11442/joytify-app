import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import useSidebarState from "../states/sidebar.state";

const NavigateRoutes = () => {
  const { collapse } = useSidebarState();
  const { isCollapsed } = collapse;

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
          icon={HiHome}
          label="Home"
          collapse={isCollapsed}
        />
        <SidebarItem
          href="/search"
          icon={BiSearch}
          label="Search"
          collapse={isCollapsed}
        />
      </div>
    </ContentBox>
  );
};

export default NavigateRoutes;
