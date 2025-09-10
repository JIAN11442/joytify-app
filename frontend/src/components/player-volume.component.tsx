import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  PiSpeakerSimpleHighFill,
  PiSpeakerSimpleLowFill,
  PiSpeakerSimpleXFill,
} from "react-icons/pi";

import Icon from "./react-icons.component";
import usePlaybackControl from "../hooks/playback-control.hook";
import { AudioVolumeType } from "@joytify/types/types";
import usePlaybackControlState from "../states/playback-control.state";
import useProviderState from "../states/provider.state";

type PlayerVolumeProps = {
  className?: string;
};

const PlayerVolume: React.FC<PlayerVolumeProps> = ({ className }) => {
  const [isSliderVisible, setIsSliderVisible] = useState(false);
  const [previousVolume, setPreviousVolume] = useState<AudioVolumeType>(0);

  const { screenWidth } = useProviderState();
  const { audioVolume } = usePlaybackControlState();
  const { adjustVolume } = usePlaybackControl();

  const handleToggleVolumeBtn = () => {
    // in max-md screen, control slider visibility
    if (isMaxMdScreen) {
      setIsSliderVisible(!isSliderVisible);
    }
    // in min-md screen, toggle volume
    else {
      if (audioVolume) {
        setPreviousVolume(audioVolume);
        adjustVolume(0);
      } else {
        adjustVolume(previousVolume);
      }
    }
  };

  const handleOnChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volumeVal = parseFloat(e.target.value) as AudioVolumeType;

    adjustVolume(volumeVal);
  };

  const volumeIcon =
    audioVolume < 0.1
      ? PiSpeakerSimpleXFill
      : audioVolume >= 0.5
      ? PiSpeakerSimpleHighFill
      : PiSpeakerSimpleLowFill;

  const isMaxMdScreen = !!(screenWidth <= 768);

  return (
    <div
      className={twMerge(
        `
          flex
          flex-shrink-0
          gap-1
          items-center
          justify-end
          ${isMaxMdScreen ? "relative" : ""}
        `,
        className
      )}
    >
      {/* volume icon */}
      <button
        onClick={handleToggleVolumeBtn}
        className={`
          text-neutral-500
          hover:text-white
          transition
        `}
      >
        <Icon name={volumeIcon} opts={{ size: 18 }} />
      </button>

      {/* volume slider */}
      <div
        className={`
          group
          flex
          p-2
          items-center
          ${
            isMaxMdScreen
              ? `
                  absolute
                  -rotate-90
                  -translate-x-1/2
                  -translate-y-1/2
                  left-1/2
                  top-[-60px]
                  w-[110px]
                  h-5
                  rounded-sm
                  bg-neutral-800
                  ${isSliderVisible ? "opacity-100" : "opacity-0"}
                `
              : "relative"
          }
        `}
      >
        <input
          type="range"
          min={0}
          max={1}
          value={audioVolume}
          step={0.1}
          onChange={(e) => handleOnChangeVolume(e)}
          onMouseUp={() => isMaxMdScreen && setIsSliderVisible(false)}
          className={`
            input-volume
            max-w-[100px]
            ${audioVolume === 0 && "volume-off"}
            ${isMaxMdScreen ? "bg-neutral-700" : ""}
          `}
        />

        <div
          style={{ left: `calc(${audioVolume * 100}px)` }}
          className={`
            absolute
            p-1
            bg-white
            rounded-full
            cursor-pointer
            group-hover:flex
            pointer-events-none
            hidden
          `}
        />
      </div>
    </div>
  );
};

export default PlayerVolume;
