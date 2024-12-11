import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  PiSpeakerSimpleHighFill,
  PiSpeakerSimpleLowFill,
  PiSpeakerSimpleXFill,
} from "react-icons/pi";

import Icon from "./react-icons.component";

import useSoundState from "../states/sound.state";
import usePlayerState from "../states/player.state";
import useProviderState from "../states/provider.state";
import { Volume } from "../constants/volume.constant";

type PlayerVolumeProps = {
  className?: string;
};

const PlayerVolume: React.FC<PlayerVolumeProps> = ({ className }) => {
  const { volume, setVolume } = usePlayerState();
  const { sound } = useSoundState();
  const { screenWidth } = useProviderState();
  const isMaxMdScreen = !!(screenWidth <= 768);

  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  // handle input volume on change
  const handleOnChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as unknown as Volume;

    sound?.volume(value);

    setVolume(value);
  };

  // handle switch audio volume button
  const handleSwitchVolumeBtn = () => {
    let volumeVal = 0 as Volume;

    if (volume) {
      setPreviousVolume(volume);
    } else {
      volumeVal = previousVolume;
    }

    sound?.volume(volumeVal);

    setVolume(volumeVal);
  };

  // handle active volume slider while max-md screen
  const toggleSliderVisibility = () => {
    if (isMaxMdScreen) {
      setIsSliderVisible(!isSliderVisible);
    }
  };

  const volumeIcon =
    volume < 0.1
      ? PiSpeakerSimpleXFill
      : volume >= 0.5
      ? PiSpeakerSimpleHighFill
      : PiSpeakerSimpleLowFill;

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
        onClick={() => {
          if (isMaxMdScreen) {
            toggleSliderVisibility();
          } else {
            handleSwitchVolumeBtn();
          }
        }}
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
          value={volume}
          step={0.1}
          onChange={(e) => handleOnChangeVolume(e)}
          onMouseUp={() => isMaxMdScreen && setIsSliderVisible(false)}
          className={`
            input-volume
            max-w-[100px]
            ${volume === 0 && "volume-off"}
            ${isMaxMdScreen ? "bg-neutral-700" : ""}
          `}
        />

        <div
          style={{ left: `calc(${volume * 100}px)` }}
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
