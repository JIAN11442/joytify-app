import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import { LuLibrary } from "react-icons/lu";

import ContentBox from "./content-box.component";
import SidebarItem from "./sidebar-item.component";
import Icon from "./react-icons.component";
import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";

const Sidebar = () => {
  const { collapse, setCollapse } = useSidebarState();
  const { isCollapsed, changeForScreenResize } = collapse;

  const { screenWidth } = useProviderState();

  // handle collapse sidebar
  const handleCollapse = () => {
    // if sidebar isn't collapsed before click, it will collapse according screen resize after click
    // otherwise, if sidebar is collapsed before click, it can't collapse according screen resize after click
    // because collapse is a user behavior action, we don't want to change it automatically
    setCollapse({
      ...collapse,
      isCollapsed: !isCollapsed,
      changeForScreenResize: isCollapsed,
    });
  };

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
        h-[100vh]
        p-2
        gap-x-2
        bg-black  
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
                  md:w-[420px]
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
          <div
            className={`
              flex
              items-center
              justify-between
              pr-2
            `}
          >
            {/* Title */}
            <SidebarItem
              icon={LuLibrary}
              label="Your Library"
              onClick={handleCollapse}
              collapse={isCollapsed}
              className={`
                py-5
                px-3
                w-fit
              `}
            />

            {/* Buttons */}
            <>
              {!isCollapsed && (
                <div
                  className={`
                  flex
                  gap-1
                `}
                >
                  {/* Search music */}
                  <button
                    className={`
                      p-2
                      rounded-full
                      hover:bg-neutral-800
                      hover:scale-110
                      transition
                      group
                    `}
                  >
                    <Icon
                      name={BiSearch}
                      opts={{ size: 20 }}
                      className={`
                        text-neutral-400
                        group-hover:text-white
                      `}
                    />
                  </button>

                  {/* Adding music */}
                  <button
                    className={`
                      p-2
                      rounded-full
                      hover:bg-neutral-800
                      hover:scale-110
                      transition
                      group
                    `}
                  >
                    <Icon
                      name={AiOutlinePlus}
                      opts={{ size: 20 }}
                      className={`
                        text-neutral-400
                        group-hover:text-white  
                      `}
                    />
                  </button>
                </div>
              )}
            </>
          </div>

          {/* Body */}
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
