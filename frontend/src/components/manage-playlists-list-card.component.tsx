import { useState } from "react";
import ManagePlaylistsCardImage from "./manage-playlists-card-image.component";
import ManagePlaylistsCardActions from "./manage-playlists-card-actions.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type ManagePlaylistsListProps = {
  fm: ScopedFormatMessage;
  playlist: PlaylistResponse;
  onClick?: () => void;
};

const ManagePlaylistsListCard: React.FC<ManagePlaylistsListProps> = ({ fm, playlist, onClick }) => {
  const playlistItemFm = fm("playlist.item");

  const { title, description, coverImage, stats } = playlist;
  const { totalSongCount, totalSongDuration } = stats;

  const [isGroupHovered, setIsGroupHovered] = useState<boolean>(false);

  const formattedDuration = formatPlaybackDuration({
    fm,
    duration: totalSongDuration,
    precise: true,
    format: "text",
  });

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      onTouchStart={() => setIsGroupHovered(true)}
      onTouchEnd={() => setIsGroupHovered(false)}
      className={`
        card-wrapper
        flex-row
        p-4
        gap-5
        from-neutral-500/10
        hover:scale-[1.01]
        cursor-pointer
        ease-in-out
        duration-200
        transition
      `}
    >
      <ManagePlaylistsCardImage coverImage={coverImage} tw={{ img: `w-20 h-20`, mask: "hidden" }} />

      <div
        className={`
          flex
          gap-10
          w-full
          items-center
          justify-between
        `}
      >
        <div
          className={`
            flex
            flex-col
            gap-2
            items-start
            justify-center
            font-ubuntu
          `}
        >
          {/* title */}
          <p className={`text-lg font-semibold`}>{title}</p>

          {/* description */}
          <p className={`text-sm text-neutral-500`}>{description}</p>

          {/* information */}
          <p
            className={`
            flex
            gap-2
            text-sm
            text-neutral-600
          `}
          >
            <span>{playlistItemFm("songs.count", { count: totalSongCount })}</span>
            <span>·</span>
            <span>{formattedDuration}</span>
          </p>
        </div>

        <ManagePlaylistsCardActions
          isGroupHovered={isGroupHovered}
          playlist={playlist}
          icon={{ opts: { size: 22 } }}
          className={`gap-5`}
        />
      </div>
    </div>
  );
};

export default ManagePlaylistsListCard;
