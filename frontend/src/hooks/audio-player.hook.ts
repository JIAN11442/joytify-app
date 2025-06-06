import { getAudioInstance } from "../lib/audio.lib";

const useAudioPlayer = () => {
  const audio = getAudioInstance();

  const play = (src: string, seekToInitialTime?: boolean) => {
    if (audio.src !== src) {
      audio.src = src;
    } else {
      if (seekToInitialTime) {
        audio.currentTime = 0;
      }
    }

    audio.play();
  };

  return {
    play,
    pause: () => audio.pause(),
    resume: () => audio.play(),
    seek: (time: number) => (audio.currentTime = time),
    volume: (volume: number) => (audio.volume = volume),
    audio,
  };
};

export default useAudioPlayer;
