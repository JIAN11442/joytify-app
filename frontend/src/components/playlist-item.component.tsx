import { useIntl } from "react-intl";
import { NavLink } from "react-router-dom";
import { PlaylistResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistItemProps = {
  playlist: PlaylistResponse;
};

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist }) => {
  const { _id, title, cover_image, songs } = playlist;

  const intl = useIntl();
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
        rounded-md
        transition-all
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
            <p>{intl.formatMessage({ id: "playlist.item.content.type" })}</p>
            <p>•</p>
            <p>
              {intl.formatMessage({ id: "playlist.item.content.songs" }, { count: songs.length })}
            </p>
          </div>
        </div>
      )}
    </NavLink>
  );
};

export default PlaylistItem;
