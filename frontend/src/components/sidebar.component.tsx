import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import ContentBox from "./content-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import Library from "./library.component";
import AudioPlayer from "./audio-player.component";
import Navbar from "./navbar.component";

import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";
import useSoundState from "../states/sound.state";
import { timeoutForEventListener } from "../lib/timeout.lib";

const Sidebar = () => {
  const floatingDivRef = useRef<HTMLDivElement>(null);

  const { collapseSideBarState, floating, setCollapseSideBarState, setFloating } =
    useSidebarState();
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
      if (floatingDivRef.current && !floatingDivRef.current.contains(e.target as Node)) {
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
        w-full
        h-screen
        p-2
        gap-2
        overflow-hidden
      `}
    >
      {/* navbar */}
      <Navbar />

      <div
        className={`
          relative
          flex
          gap-x-2
          ${activeSongId ? "h-[calc(100vh-80px)]" : "h-full"}
          overflow-hidden
        `}
      >
        {/* sidebar */}
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
          {/* Library */}
          <Library />
        </div>

        {/* float sidebar */}
        <AnimationWrapper
          ref={floatingDivRef}
          visible={floating}
          initial={{ width: "0%", opacity: 0 }}
          animate={{
            width:
              screenWidth > 0 && screenWidth <= 500 ? (screenWidth <= 430 ? "90%" : "70%") : "60%",
            opacity: 1,
          }}
          exit={{ width: "20%", opacity: 0 }}
          transition={{ duration: 0.3 }}
          mode="sync"
          className={`floating-menu`}
        >
          <Library />
        </AnimationWrapper>

        {/* content */}
        <ContentBox
          className={`
            h-full
            overflow-y-auto
          `}
        >
          <Outlet />
        </ContentBox>
      </div>

      <AudioPlayer songId={activeSongId} />
    </div>
  );
};

export default Sidebar;
