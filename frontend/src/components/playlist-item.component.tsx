import { NavLink } from "react-router-dom";

import { useScopedIntl } from "../hooks/intl.hook";
import { PlaylistResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistItemProps = {
  playlist: PlaylistResponse;
};

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist }) => {
  const { _id, title, coverImage, songs } = playlist;

  const { fm } = useScopedIntl();
  const playlistItemFm = fm("playlist.item");
  const { collapseSideBarState, activeFloatingSidebar, closeFloatingSidebar } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const handleCloseFloatingMenu = () => {
    timeoutForDelay(() => {
      if (activeFloatingSidebar) {
        closeFloatingSidebar();
      }
    });
  };

  return (
    <NavLink
      to={`/playlist/${_id}`}
      onClick={handleCloseFloatingMenu}
      className={({ isActive }) => `
        flex
        w-full
        gap-x-3
        ${
          !isCollapsed && isActive
            ? "bg-neutral-800 hover:bg-neutral-700/50"
            : "hover:bg-neutral-800/50"
        }
        ${
          isCollapsed && !activeFloatingSidebar
            ? "p-0 hover:opacity-80"
            : `p-2 ${!isActive && "pl-0 hover:pl-2"}`
        }
        items-center
        rounded-md
        transition-all
      `}
    >
      {/* cover image */}
      <img
        alt="playlist-cover-image"
        src={coverImage}
        className={`
          w-[3.3rem]
          h-[3.3rem]
          object-cover
          shrink-0
          rounded-md
        `}
      />

      {/* content */}
      {(!isCollapsed || activeFloatingSidebar) && (
        <div
          className={`
            flex
            flex-col
            w-full
            gap-1
            items-start
            justify-center
            text-[14px]
            text-neutral-300
          `}
        >
          <p className={`line-clamp-1`}>{title}</p>
          <span
            className={`
              flex
              gap-1
              text-sm
              text-neutral-500
            `}
          >
            {playlistItemFm("description", {
              type: playlistItemFm("type"),
              count: playlistItemFm("songs.count", { count: songs.length }),
            })}
          </span>
        </div>
      )}
    </NavLink>
  );
};

export default PlaylistItem;
