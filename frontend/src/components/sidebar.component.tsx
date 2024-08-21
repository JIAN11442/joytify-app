import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";

import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import LibraryBody from "./library-body.component";
import LibraryHeader from "./library-header.component";

import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";

const Sidebar = () => {
  const { collapse, setCollapse } = useSidebarState();
  const { isCollapsed, changeForScreenResize } = collapse;

  const { screenWidth } = useProviderState();

  // while changeForScreenSize is true,
  // collapse sidebar while screen is md in tailwindcss
  useEffect(() => {
    if (
      screenWidth > 0 &&
      screenWidth <= 768 &&
      !isCollapsed &&
      changeForScreenResize
    ) {
      setCollapse({
        ...collapse,
        isCollapsed: true,
        changeForScreenResize: true,
      });
    } else if (screenWidth > 768 && changeForScreenResize) {
      setCollapse({
        ...collapse,
        isCollapsed: false,
      });
    }
  }, [screenWidth]);

  return (
    <div
      className={`
        flex
        h-screen
        p-2
        gap-x-2
      `}
    >
      {/* Sidebars */}
      <div
        className={`
          flex
          flex-col
          h-full
          ${
            isCollapsed
              ? `w-[70px]`
              : ` 
                  max-md:w-[380px]
                  md:w-[500px]
                `
          }
          gap-2
          duration-200
        `}
      >
        {/* Navigate routes */}
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

        {/* Library */}
        <ContentBox
          className={`
            h-full
            p-2
          `}
        >
          {/* Header */}
          <LibraryHeader />

          {/* Body */}
          <LibraryBody />
        </ContentBox>
      </div>

      {/* Main contents */}
      <ContentBox
        className={`
          h-full  
        `}
      >
        <Outlet />
      </ContentBox>
    </div>
  );
};

export default Sidebar;
