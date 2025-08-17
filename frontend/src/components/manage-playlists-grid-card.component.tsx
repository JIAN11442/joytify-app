import { useState } from "react";
import { PiClock, PiMusicNoteFill } from "react-icons/pi";
import Icon from "./react-icons.component";
import ManagePlaylistsCardImage from "./manage-playlists-card-image.component";
import ManagePlaylistsCardActions from "./manage-playlists-card-actions.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type ManagePlaylistsGridCardProps = {
  fm: ScopedFormatMessage;
  playlist: PlaylistResponse;
  onClick?: () => void;
};

const ManagePlaylistsGridCard: React.FC<ManagePlaylistsGridCardProps> = ({
  fm,
  playlist,
  onClick,
}) => {
  const { title, coverImage, stats } = playlist;
  const { totalSongCount, totalSongDuration } = stats;

  const [isGroupHovered, setIsGroupHovered] = useState(false);

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
      className={`card-wrapper cursor-pointer`}
    >
      {/* image */}
      <ManagePlaylistsCardImage coverImage={coverImage}>
        {/* tags */}
        <div
          className={`
            absolute
            top-2
            flex
            w-full
            px-2
            mt-2
            items-center
            justify-between
            text-sm
          `}
        >
          <div className={`tag-label-secondary`}>
            <Icon name={PiClock} opts={{ size: 16 }} />
            <p>{formattedDuration}</p>
          </div>

          <div className={`tag-label-secondary`}>
            <p>{totalSongCount}</p>
            <Icon name={PiMusicNoteFill} opts={{ size: 14 }} />
          </div>
        </div>
      </ManagePlaylistsCardImage>

      {/* content */}
      <div
        className={`
          flex
          w-full
          gap-5
          items-center
          justify-between
          text-sm
        `}
      >
        {/* title */}
        <p className={`text-neutral-300 font-semibold truncate`}>{title}</p>

        {/* actions */}
        <ManagePlaylistsCardActions isGroupHovered={isGroupHovered} playlist={playlist} />
      </div>
    </div>
  );
};

export default ManagePlaylistsGridCard;
