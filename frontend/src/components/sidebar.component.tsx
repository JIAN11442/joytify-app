import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import ContentBox from "./content-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import MainNavigateRoutes from "./main-routes.component";
import Library from "./library.component";
import AudioPlayer from "./audio-player.component";

import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";
import useSoundState from "../states/sound.state";
import { timeoutForEventListener } from "../lib/timeout.lib";

const Sidebar = () => {
  const floatingDivRef = useRef<HTMLDivElement>(null);
  const {
    collapseSideBarState,
    floating,
    setCollapseSideBarState,
    setFloating,
  } = useSidebarState();
  const { isCollapsed, changeForScreenResize } = collapseSideBarState;

  const { screenWidth } = useProviderState();

  const { activeSongId } = useSoundState();

  // handle sidebar collapse mode for different screen sizes
  useEffect(() => {
    if (screenWidth > 640 && screenWidth <= 768) {
      if (!isCollapsed && changeForScreenResize) {
        setCollapseSideBarState({
          ...collapseSideBarState,
          isCollapsed: true,
          changeForScreenResize: true,
        });
      }

      setFloating(false);
    } else {
      if (changeForScreenResize) {
        setCollapseSideBarState({
          ...collapseSideBarState,
          isCollapsed: false,
        });
      }

      setFloating(false);
    }
  }, [screenWidth]);

  useEffect(() => {
    const handleOnBlur: EventListener = (e) => {
      if (
        floatingDivRef.current &&
        !floatingDivRef.current.contains(e.target as Node)
      ) {
        setFloating(false);
      }
    };

    return timeoutForEventListener(document, "click", handleOnBlur);
  }, [floatingDivRef]);

  return (
    <div
      className={`
        flex
        flex-col
        p-2
        gap-2
      `}
    >
      <div
        className={`
          relative
          flex
          h-screen
          gap-x-2
          ${activeSongId ? "h-[calc(100vh-80px)]" : "h-full"}
        `}
      >
        {/* Sidebars */}
        <div
          className={`
            flex
            flex-col
            h-full
            gap-2
            max-sm:hidden
            transition-all
            ease-in-out
            duration-300
            ${isCollapsed ? `w-[70px]` : `w-[500px]`}
           
          `}
        >
          {/* Navigate routes */}
          <MainNavigateRoutes />

          {/* Library */}
          <Library />
        </div>

        {/* Float sidebars */}
        <AnimationWrapper
          ref={floatingDivRef}
          visible={floating}
          initial={{ width: "0%", opacity: 0 }}
          animate={{
            width:
              screenWidth > 0 && screenWidth <= 500
                ? screenWidth <= 430
                  ? "90%"
                  : "70%"
                : "60%",
            opacity: 1,
          }}
          transition={{ duration: 0.3 }} // 增加动画持续时间
          exit={{ width: "20%", opacity: 0 }}
          mode="sync"
          className={`
            fixed
            inset-0
            h-full
            flex
            flex-col
            gap-y-2
            p-2
          bg-black
            border-r
            border-neutral-800/50
            shadow-md
            shadow-neutral-700
            z-10
          `}
        >
          <MainNavigateRoutes />
          <Library />
        </AnimationWrapper>

        {/* Main contents */}
        <ContentBox
          className={`
            h-full
            overflow-hidden
          `}
        >
          <Outlet />
        </ContentBox>
      </div>

      {activeSongId && <AudioPlayer songId={activeSongId} />}
    </div>
  );
};

export default Sidebar;
