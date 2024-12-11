import { twMerge } from "tailwind-merge";

import ImageLabel from "./image-label.component";

import { refactorResPlaylist } from "../constants/axios-response.constant";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistHeaderProps = {
  playlist: refactorResPlaylist;
  className?: string;
};

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  playlist,
  className,
}) => {
  const {
    _id: playlistId,
    title,
    songs,
    description,
    cover_image,
    default: isDefault,
  } = playlist;
  const { setActivePlaylistEditModal } = usePlaylistState();
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  // handle active playlist edit modal
  const handleActivePlaylistEditModal = () => {
    if (isDefault) return;

    timeoutForDelay(() => {
      setActivePlaylistEditModal({ active: true, playlist });
    });
  };

  return (
    <div
      className={twMerge(
        `
          flex
          gap-x-5
        `,
        className
      )}
    >
      {/* Playlist cover image */}
      <ImageLabel
        src={cover_image}
        playlistId={playlistId}
        isDefault={isDefault}
      />

      {/* Title */}
      <div
        className={`
          flex
          flex-col
          py-1
          lg:py-0
          items-start
          justify-between
        `}
      >
        {/* type */}
        <p>
          <span>Playlist</span>
          {description && (
            <>
              <span> · </span>
              <span>{songs.length} songs</span>
            </>
          )}
        </p>

        {/* title */}
        <button
          onClick={handleActivePlaylistEditModal}
          className={`
            ${isDefault ? "cursor-default" : "cursor-pointer"}
          `}
        >
          <p
            style={{ lineHeight: "1.15" }}
            className={`
              text-left
              text-5xl
              sm:text-6xl
              ${
                isCollapsed
                  ? `
                      md:text-[5.5rem]
                      lg:text[6rem]
                    `
                  : `
                      lg:text-[5.5rem]
                    `
              }
              font-extrabold
              font-serif
              line-clamp-1
            `}
          >
            {title}
          </p>
        </button>

        {/* other */}
        <>
          {description ? (
            <p
              className={`
                text-grey-custom/50
                truncate
                line-clamp-1
              `}
            >
              {description}
            </p>
          ) : (
            <p>{songs?.length} songs</p>
          )}
        </>
      </div>
    </div>
  );
};

export default PlaylistHeader;
