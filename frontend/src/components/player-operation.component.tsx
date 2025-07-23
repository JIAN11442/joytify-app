import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { AiOutlineStop } from "react-icons/ai";
import { RiLoopLeftLine } from "react-icons/ri";
import { LuDot, LuShuffle } from "react-icons/lu";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { MdSkipNext, MdSkipPrevious } from "react-icons/md";

import Icon from "./react-icons.component";
import PlayerSlider from "./player-slider.component";
import usePlaybackControl from "../hooks/playback-control.hook";
import { LoopMode } from "@joytify/shared-types/constants";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";
import { resetMusicAudioInstance } from "../lib/music-audio.lib";

type PlayerOperationProps = {
  song: RefactorSongResponse;
  className?: string;
};

const PlayerOperation: React.FC<PlayerOperationProps> = ({ song, className }) => {
  const { NONE, TRACK } = LoopMode;

  const { shuffleSong, switchSong, togglePlayback, cycleLoop } = usePlaybackControl();
  const { isShuffle, isPlaying, loopMode } = usePlaybackControlState();

  const handleShuffleSong = useCallback(() => {
    shuffleSong(!isShuffle);
  }, [isShuffle]);

  const handleSwitchToPreviousSong = () => {
    switchSong("prev");
  };

  const handleSwitchToNextSong = () => {
    switchSong("next");
  };

  const handleCycleLoop = () => {
    cycleLoop();
  };

  const handleStopAudio = () => {
    resetMusicAudioInstance();
  };

  return (
    <div className={twMerge(`flex flex-col`, className)}>
      {/* slider */}
      <PlayerSlider song={song} className={`max-sm:hidden`} />

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
          type="button"
          title="shuffle"
          onClick={handleShuffleSong}
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
        <button
          type="button"
          title="previous"
          onClick={handleSwitchToPreviousSong}
          className={`player-btn`}
        >
          <Icon name={MdSkipPrevious} opts={{ size: 30 }} />
        </button>

        {/* play or pause */}
        <button
          type="button"
          title="play or pause"
          onClick={togglePlayback}
          className={`
            p-2
            rounded-full
            bg-white
            text-black
            hover:scale-105
            transition
          `}
        >
          <Icon name={isPlaying ? BsPauseFill : BsPlayFill} opts={{ size: 20 }} />
        </button>

        {/* next */}
        <button
          type="button"
          title="next"
          onClick={handleSwitchToNextSong}
          className={`player-btn`}
        >
          <Icon name={MdSkipNext} opts={{ size: 30 }} />
        </button>

        {/* loop */}
        <button
          type="button"
          title="loop"
          onClick={handleCycleLoop}
          className={`relative player-btn`}
        >
          <Icon
            name={RiLoopLeftLine}
            opts={{ size: 26 }}
            className={`
              ${loopMode !== NONE && "text-green-500"}
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
              ${loopMode === TRACK ? "flex text-green-500" : "hidden"}
            `}
          >
            1
          </p>
        </button>

        {/* stop */}
        <button type="button" title="stop" onClick={handleStopAudio}>
          <Icon name={AiOutlineStop} opts={{ size: 26 }} className={`player-btn`} />
        </button>
      </div>
    </div>
  );
};

export default PlayerOperation;
