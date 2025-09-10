import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import usePlaybackControl from "../hooks/playback-control.hook";
import { RefactorSongResponse } from "@joytify/types/types";
import usePlaybackControlState from "../states/playback-control.state";
import { getDuration } from "../utils/get-time.util";

type PlayerSliderProps = {
  song: RefactorSongResponse;
  hiddenTime?: boolean;
  className?: string;
};

const PlayerSlider: React.FC<PlayerSliderProps> = ({ song, hiddenTime = false, className }) => {
  const { duration } = song;
  const { seekAudio } = usePlaybackControl();
  const { progressTime } = usePlaybackControlState();

  const handleChangeSongSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      seekAudio(value);
    },
    [seekAudio]
  );

  const formattedProgressTime = getDuration(progressTime);
  const formattedDurationTime = getDuration(duration);

  return (
    <div
      className={twMerge(
        `
          flex 
          w-full
          gap-3
          items-center
        `,
        className
      )}
    >
      {/* start time */}
      {!hiddenTime && <p className={`slider-time`}>{formattedProgressTime}</p>}

      {/* slider */}
      <input
        type="range"
        min={0}
        max={duration}
        value={progressTime}
        step={1}
        onChange={handleChangeSongSeek}
        className={`input-slider`}
      />

      {/* end time */}
      {!hiddenTime && <p className={`slider-time`}>{formattedDurationTime}</p>}
    </div>
  );
};

export default PlayerSlider;
