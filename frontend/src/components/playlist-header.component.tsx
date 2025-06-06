import { twMerge } from "tailwind-merge";

import ImageLabel from "./image-label.component";

import { useScopedIntl } from "../hooks/intl.hook";
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
  const { _id: playlistId, title, songs, description, coverImage, default: isDefault } = playlist;

  const { fm } = useScopedIntl();
  const playlistItemFm = fm("playlist.item");
  const playlistBannerSectionFm = fm("playlist.banner.section");

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
        src={coverImage}
        subfolder={UploadFolder.PLAYLISTS_IMAGE}
        updateConfig={{
          updateImgFn: (awsImageUrl) => updatePlaylistFn({ coverImage: awsImageUrl }),
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
          {playlistBannerSectionFm("type", {
            type: playlistItemFm("type"),
            separator: description ? " · " : "",
            description: description ? playlistItemFm("songs.count", { count: songs.length }) : "",
          })}
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
        <p className={`text-grey-custom/50 line-clamp-1`}>
          {description ? description : playlistItemFm("songs.count", { count: songs.length })}
        </p>
      </div>
    </div>
  );
};

export default PlaylistHeader;
