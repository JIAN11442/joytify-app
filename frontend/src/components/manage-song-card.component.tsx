import { useState } from "react";
import Icon from "./react-icons.component";
import ManageSongCardImage from "./manage-song-card-image.component";
import { getManageSongCardActionsContent } from "../contents/manage-song-card-actions.content";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import useUserState from "../states/user.state";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ManageSongCardProps = {
  songs: RefactorSongResponse[];
  currentIndex: number;
};

const ManageSongCard: React.FC<ManageSongCardProps> = ({ songs, currentIndex }) => {
  const [isGroupHovered, setIsGroupHovered] = useState(false);

  const { authUser } = useUserState();
  const { audioSong, isPlaying } = usePlaybackControlState();
  const { setActiveSongDetailCardModal } = useSongState();

  const song = songs[currentIndex];
  const { title, artist } = song;

  const playingSongCard = audioSong?._id === song._id;
  const isRated = song.ratings.some((rating) => rating.id === authUser?._id);
  const songCardActions = getManageSongCardActionsContent({ song, isRated });

  const handleActiveSongDetailCardModal = () => {
    timeoutForDelay(() => {
      setActiveSongDetailCardModal({
        active: true,
        songs,
        currentIndex,
      });
    });
  };

  return (
    <div
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      onTouchStart={() => setIsGroupHovered(true)}
      onTouchEnd={() => setIsGroupHovered(false)}
      onClick={handleActiveSongDetailCardModal}
      className={`
        group
        card-wrapper
        ${
          playingSongCard
            ? `
              border-[1px]
              border-purple-400/50
              shadow-purple-400
              ${!isPlaying && "animate-shadow-pulse-3"}
              `
            : `
              border-[0.1px]
              hover:shadow-sky-300/50
              `
        }
        cursor-pointer
      `}
    >
      {/* image */}
      <ManageSongCardImage
        songs={songs}
        currentIndex={currentIndex}
        isPlayingSongCard={playingSongCard}
      />

      {/* content */}
      <div
        className={`
          grid
          grid-cols-2
          mt-1
          items-center
          justify-between
          text-sm
          text-neutral-300
      `}
      >
        {/* title & artist */}
        <p
          className={`
            flex
            gap-2 
            items-start
          `}
        >
          <span className={`font-semibold whitespace-nowrap`}>{title}</span>
          <span>·</span>
          <span className={`text-neutral-500 truncate`}>{artist}</span>
        </p>

        {/* actions */}
        <div
          className={`
            flex
            w-full
            py-1
            gap-3
            items-center
            justify-end
            rounded-md
          `}
        >
          {songCardActions.map((action) => {
            const { id, icon, color, hidden, onClick } = action;

            return (
              <button
                key={id}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                style={{ color: isGroupHovered ? color : undefined }}
                className={`
                  flex
                  text-neutral-500/50
                  opacity-50
                  hover:opacity-100
                  items-center
                  justify-center
                  rounded-md
                  duration-300
                  transition-all
                  ${hidden && "hidden"}
                `}
              >
                <Icon name={icon.name} opts={{ size: icon.size }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageSongCard;
