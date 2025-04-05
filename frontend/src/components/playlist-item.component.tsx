import { NavLink } from "react-router-dom";
import useSidebarState from "../states/sidebar.state";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistItemProps = {
  playlist: PlaylistResponse;
};

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist }) => {
  const { _id, title, cover_image, songs } = playlist;

  const { collapseSideBarState, activeFloatingSidebar, setActiveFloatingSidebar } =
    useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  // handle close floating menu
  const handleCloseFloatingMenu = () => {
    if (activeFloatingSidebar) {
      timeoutForDelay(() => {
        setActiveFloatingSidebar(false);
      });
    }
  };

  return (
    <NavLink
      to={`/playlist/${_id}`}
      onClick={handleCloseFloatingMenu}
      className={({ isActive }) => `
        flex
        w-full
        gap-x-3
        rounded-md
        transition
        ${
          !isCollapsed && isActive
            ? "bg-neutral-800 hover:bg-neutral-700/50"
            : "hover:bg-neutral-800/50"
        }
        ${isCollapsed && !activeFloatingSidebar ? "p-0 hover:opacity-80" : "p-2"}
      `}
    >
      {/* cover image */}
      <img
        alt="playlist-cover-image"
        src={cover_image}
        className={`
          w-[3.3rem]
          h-[3.3rem]
          object-cover
          rounded-md
        `}
      />

      {/* content */}
      {(!isCollapsed || activeFloatingSidebar) && (
        <div
          className={`
            flex
            flex-col
            gap-1
            items-start
            justify-center
            text-right
            text-[14px]
            text-neutral-300
          `}
        >
          <p>{title}</p>
          <div
            className={`
              flex
              gap-1
              text-sm
              text-neutral-500
            `}
          >
            <p>Playlist</p>
            <p>•</p>
            <p>{songs.length} songs</p>
          </div>
        </div>
      )}
    </NavLink>
  );
};

export default PlaylistItem;
