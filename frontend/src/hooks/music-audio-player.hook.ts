import { getMusicAudioInstance } from "../lib/music-audio.lib";

const useMusicAudioPlayer = () => {
  const musicAudio = getMusicAudioInstance();

  const play = (src: string, seekToInitialTime?: boolean) => {
    if (musicAudio.src !== src) {
      musicAudio.src = src;
    } else {
      if (seekToInitialTime) {
        musicAudio.currentTime = 0;
      }
    }

    musicAudio.play();
  };

  return {
    play,
    pause: () => musicAudio.pause(),
    resume: () => musicAudio.play(),
    seek: (time: number) => (musicAudio.currentTime = time),
    volume: (volume: number) => (musicAudio.volume = volume),
    musicAudio,
  };
};

export default useMusicAudioPlayer;
