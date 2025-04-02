import { twMerge } from "tailwind-merge";

import ImageLabel from "./image-label.component";

import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type PlaylistHeaderProps = {
  playlist: RefactorPlaylistResponse;
  className?: string;
};

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ playlist, className }) => {
  const { _id: playlistId, title, songs, description, cover_image, default: isDefault } = playlist;

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

  // update playlist mutation
  const { mutate: updatePlaylistFn, isPending } = useUpdatePlaylistMutation(playlistId);

  return (
    <div
      className={twMerge(
        `
          flex
          px-6
          gap-x-5
          w-full
        `,
        className
      )}
    >
      {/* Playlist cover image */}
      <ImageLabel
        src={cover_image}
        subfolder={UploadFolder.PLAYLISTS_IMAGE}
        updateConfig={{
          updateImgFn: (awsImageUrl) => updatePlaylistFn({ cover_image: awsImageUrl }),
          isPending,
        }}
        isDefault={isDefault}
      />

      {/* content */}
      <div
        className={`
          flex
          flex-col
          w-full
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
          type="button"
          onClick={handleActivePlaylistEditModal}
          className={`
            ${isDefault ? "cursor-default" : "cursor-pointer"}
          `}
        >
          <h1
            style={{ lineHeight: "1.15" }}
            className={`
              info-title
              ${isCollapsed ? "lg:text-[7rem]" : "lg:text-[6.5rem]"}
            `}
          >
            {title}
          </h1>
        </button>

        {/* other - description or songs count */}
        {description ? (
          <p
            className={`
              text-grey-custom/50
              line-clamp-1
            `}
          >
            {description}
          </p>
        ) : (
          <p>{songs?.length} songs</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistHeader;
