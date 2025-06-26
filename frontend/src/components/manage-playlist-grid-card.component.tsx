import { useState } from "react";
import { PiClock, PiMusicNoteFill } from "react-icons/pi";

import Icon from "./react-icons.component";
import ManagePlaylistCardImage from "./manage-playlist-card-image.component";
import ManagePlaylistCardActions from "./manage-playlist-card-actions.component";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type ManagePlaylistGridCardProps = {
  playlist: PlaylistResponse;
};

const ManagePlaylistGridCard: React.FC<ManagePlaylistGridCardProps> = ({ playlist }) => {
  const { title, coverImage, stats } = playlist;
  const { totalSongCount, totalSongDuration } = stats;

  const [isGroupHovered, setIsGroupHovered] = useState(false);

  return (
    <div
      className={`card-wrapper`}
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      onTouchStart={() => setIsGroupHovered(true)}
      onTouchEnd={() => setIsGroupHovered(false)}
    >
      {/* image */}
      <ManagePlaylistCardImage coverImage={coverImage}>
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
            <p>{formatPlaybackDuration(totalSongDuration, true, "text")}</p>
          </div>

          <div className={`tag-label-secondary`}>
            <p>{totalSongCount}</p>
            <Icon name={PiMusicNoteFill} opts={{ size: 14 }} />
          </div>
        </div>
      </ManagePlaylistCardImage>

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
        <ManagePlaylistCardActions isGroupHovered={isGroupHovered} playlist={playlist} />
      </div>
    </div>
  );
};

export default ManagePlaylistGridCard;
