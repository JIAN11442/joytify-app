import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./navbar.component";
import ContentBox from "./content-box.component";
import AudioPlayer from "./audio-player.component";
import AnimationWrapper from "./animation-wrapper.component";
import SidebarInnerContent from "./sidebar-inner-content.component";

import useSoundState from "../states/sound.state";
import useSidebarState from "../states/sidebar.state";
import useProviderState from "../states/provider.state";
import { timeoutForEventListener } from "../lib/timeout.lib";

const Sidebar = () => {
  const floatingDivRef = useRef<HTMLDivElement>(null);

  const {
    collapseSideBarState,
    activeFloatingSidebar,
    setCollapseSideBarState,
    setActiveFloatingSidebar,
  } = useSidebarState();
  const { isCollapsed, isManualToggle } = collapseSideBarState;
  const { screenWidth } = useProviderState();
  const { activeSongId } = useSoundState();

  // handle sidebar collapse mode for different screen sizes
  useEffect(() => {
    if (!isManualToggle) {
      // medium screen (640px < width <= 768px)
      if (screenWidth > 640 && screenWidth <= 768) {
        if (!isCollapsed) {
          setCollapseSideBarState({
            ...collapseSideBarState,
            isCollapsed: true,
            isManualToggle: false,
          });

          setActiveFloatingSidebar(false);
        }
      }
      // desktop screen (width > 768px)
      else if (screenWidth > 768) {
        setCollapseSideBarState({
          ...collapseSideBarState,
          isCollapsed: false,
          isManualToggle: false,
        });

        setActiveFloatingSidebar(false);
      }
      // mobile screen (width <= 640px)
      else {
        setActiveFloatingSidebar(true);
      }
    }
  }, [screenWidth]);

  // handle floating sidebar close on blur
  useEffect(() => {
    const handleOnBlur: EventListener = (e) => {
      if (floatingDivRef.current && !floatingDivRef.current.contains(e.target as Node)) {
        setActiveFloatingSidebar(false);
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
          ${activeSongId ? "pb-[80px]" : "h-full"}
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
          <SidebarInnerContent />
        </div>

        {/* float sidebar */}
        <AnimationWrapper
          ref={floatingDivRef}
          visible={activeFloatingSidebar}
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
          <SidebarInnerContent />
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
