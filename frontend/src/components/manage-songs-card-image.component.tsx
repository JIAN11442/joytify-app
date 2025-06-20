import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { FaStar } from "react-icons/fa";
import { IoPause, IoPlayOutline } from "react-icons/io5";
import Icon from "./react-icons.component";
import SoundWave from "./sound-wave.component";
import usePlaybackControl from "../hooks/playback-control.hook";
import { Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import { formatPlaybackCount } from "../utils/unit-format.util";

type ManageSongCardImageProps = {
  songs: RefactorSongResponse[];
  currentIndex: number;
  isPlayingSongCard?: boolean;
  children?: React.ReactNode;
  hasStats?: boolean;
  hasTags?: boolean;
  hasPlayButton?: boolean;
  hasSoundWave?: boolean;
  className?: string;
  tw?: {
    img?: string;
    children?: string;
  };
};

const ManageSongCardImage: React.FC<ManageSongCardImageProps> = ({
  songs,
  currentIndex,
  isPlayingSongCard = false,
  hasTags = true,
  hasStats = true,
  hasPlayButton = true,
  hasSoundWave = true,
  children,
  className,
  tw,
}) => {
  const song = songs[currentIndex];
  const { imageUrl, activities, ratings, genres, tags } = song;
  const { averageRating, totalPlaybackCount } = activities;

  const { playSong } = usePlaybackControl();
  const { isPlaying } = usePlaybackControlState();

  const handlePlaySong = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      playSong({
        playlistSongs: songs,
        queue: songs as unknown as Queue,
        currentIndex,
        currentPlaySongId: songs[currentIndex]._id,
      });
    },
    [playSong, songs, currentIndex]
  );

  return (
    <div className={twMerge(`group relative w-full h-full overflow-hidden`, className)}>
      <img
        src={imageUrl}
        className={twMerge(
          `
          w-full
          h-[250px]
          object-cover
          group-hover:scale-110
          duration-300
          rounded-md
        `,
          tw?.img
        )}
      />

      {/* mask */}
      <div className={`image-bottom-mask group-hover:rounded-none`} />

      {/* tags */}
      {hasTags && (
        <div
          className={`
            absolute
            top-2
            left-2
            flex 
            gap-2 
            mt-2
          `}
        >
          {genres.length > 0 && <div className={`tag-label`}>{genres[0]}</div>}
          {tags.length > 0 && <div className={`tag-label`}>{tags[0]}</div>}
        </div>
      )}

      {/* play button */}
      {hasPlayButton && (
        <button
          onClick={handlePlaySong}
          className={`
            absolute
            -translate-x-1/2
            -translate-y-1/2
            top-1/2
            left-1/2
            p-3
            bg-purple-400
            hover:bg-purple-400/80
            hover:scale-110
            ${
              isPlayingSongCard
                ? "opacity-100"
                : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
            }
            rounded-md
            duration-300
            transition-all
        `}
        >
          <Icon
            name={isPlayingSongCard ? (isPlaying ? IoPause : IoPlayOutline) : IoPlayOutline}
            opts={{ size: 25 }}
          />
        </button>
      )}

      {/* rating & playback count */}
      {hasStats && (
        <div
          className={`
            absolute
            bottom-2
            flex
            px-4
            w-full
            items-center
            justify-between
          `}
        >
          {/* rating */}
          <div
            className={`
              flex
              gap-2
              text-sm
              font-ubuntu
              text-neutral-300
              items-center
            `}
          >
            <Icon name={FaStar} opts={{ size: 12 }} className={`text-yellow-300`} />
            <p className={`flex gap-2`}>
              <span>{averageRating}</span>
              <span>({ratings.length})</span>
            </p>
          </div>

          {/* playback count */}
          <div
            className={`
              flex
              gap-2
              items-center
              text-sm
              text-neutral-300
            `}
          >
            <Icon name={IoPlayOutline} opts={{ size: 12 }} />
            <p>{formatPlaybackCount(totalPlaybackCount)}</p>
          </div>
        </div>
      )}

      {/* sound wave */}
      {hasSoundWave && isPlayingSongCard && isPlaying && (
        <div
          className={`
            absolute
            top-5
            right-5
          `}
        >
          <SoundWave barWidth={3} color="#a855f7" />
        </div>
      )}

      {/* children */}
      {children}
    </div>
  );
};

export default ManageSongCardImage;
