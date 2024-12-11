import { twMerge } from "tailwind-merge";
import { LuDot, LuShuffle } from "react-icons/lu";
import { RiLoopLeftLine } from "react-icons/ri";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";

import Icon from "./react-icons.component";
import PlayerSlider from "./player-slider.component";

import useSoundState from "../states/sound.state";
import usePlayerState from "../states/player.state";
import usePlaylistState from "../states/playlist.state";
import { refactorResSong } from "../constants/axios-response.constant";
import SongLoopOptions from "../constants/song-loop-mode.constant";
import { SoundOutputType } from "../hooks/sound.hook";

type PlayerOperationProps = {
  song: refactorResSong;
  sound: SoundOutputType;
  className?: string;
};

const PlayerOperation: React.FC<PlayerOperationProps> = ({
  song,
  sound,
  className,
}) => {
  const { isShuffle, setIsShuffle, loopType, setLoopType } = usePlayerState();
  const { songIds, isPlaying, activeSongId, onPlay, shuffleSongIds } =
    useSoundState();

  const { targetPlaylist } = usePlaylistState();

  const currentIndex = songIds.indexOf(activeSongId);

  // handle switch play and pause
  const handleSwitchPlayOrPauseState = () => {
    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
  };

  // handle switch to previous song
  const handleSwitchToPreviousSong = () => {
    const previousIndex =
      currentIndex === 0 ? songIds.length - 1 : currentIndex - 1;

    if (onPlay) {
      onPlay(songIds[previousIndex]);
    }
  };

  // handle switch to next song
  const handleSwitchToNextSong = () => {
    const nextIndex =
      currentIndex === songIds.length - 1 ? 0 : currentIndex + 1;

    if (onPlay) {
      onPlay(songIds[nextIndex]);
    }
  };

  // handle change shuffle button state
  const handleChangeShuffleState = () => {
    setIsShuffle(!isShuffle);

    if (shuffleSongIds) {
      shuffleSongIds(activeSongId);
    }

    // If loopType is active when shuffle button is clicked, turn it off
    if (loopType !== SongLoopOptions.OFF) {
      setLoopType(SongLoopOptions.OFF);
    }
  };

  // handle switch loop type
  const handleSwitchLoopState = () => {
    // prevent switching to playlist loop when only one song is available
    const nextLoopType = {
      [SongLoopOptions.OFF]:
        (targetPlaylist?.songs.length ?? 0) > 1
          ? SongLoopOptions.PLAYLIST
          : SongLoopOptions.TRACK,
      [SongLoopOptions.PLAYLIST]: SongLoopOptions.TRACK,
      [SongLoopOptions.TRACK]: SongLoopOptions.OFF,
    }[loopType];

    setLoopType(nextLoopType);

    // if shuffle is active when loop button is clicked, turn it off
    if (nextLoopType !== SongLoopOptions.OFF) {
      setIsShuffle(false);
    }
  };

  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
        `,
        className
      )}
    >
      {/* slider */}
      <PlayerSlider song={song} sound={sound} />

      {/* operation */}
      <div
        className={`
          flex
          gap-3
          items-center
          justify-center
        `}
      >
        {/* shuffle */}
        <button
          onClick={handleChangeShuffleState}
          className={`
            relative
            flex
            items-center
             ${isShuffle ? "text-green-500" : "player-btn"}
          `}
        >
          <Icon name={LuShuffle} opts={{ size: 24 }} />
          <Icon
            name={LuDot}
            className={`
              absolute
              -right-2
              ${isShuffle ? "flex" : "hidden"}
            `}
          />
        </button>

        {/* previous */}
        <button onClick={handleSwitchToPreviousSong} className={`player-btn`}>
          <Icon name={MdSkipPrevious} opts={{ size: 30 }} />
        </button>

        {/* play or pause */}
        <button
          onClick={handleSwitchPlayOrPauseState}
          className={`
            p-2
            rounded-full
            bg-white
            text-black
            hover:scale-105
            transition
          `}
        >
          <Icon
            name={isPlaying ? BsPauseFill : BsPlayFill}
            opts={{ size: 20 }}
          />
        </button>

        {/* next */}
        <button onClick={handleSwitchToNextSong} className={`player-btn`}>
          <Icon name={MdSkipNext} opts={{ size: 30 }} />
        </button>

        {/* loop */}
        <button
          onClick={handleSwitchLoopState}
          className={`relative player-btn`}
        >
          <Icon
            name={RiLoopLeftLine}
            opts={{ size: 26 }}
            className={`
             ${loopType !== SongLoopOptions.OFF && "text-green-500"}
            `}
          />

          <p
            className={`
              absolute
              -translate-x-1/2
              -translate-y-1/2
              top-1/2
              left-1/2
              text-[10px]
              ${
                loopType === SongLoopOptions.TRACK
                  ? "flex text-green-500"
                  : "hidden"
              }
            `}
          >
            1
          </p>
        </button>
      </div>
    </div>
  );
};

export default PlayerOperation;
