import { useEffect, useRef, useState, useCallback } from "react";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import useSoundState from "../states/sound.state";
import { Volume } from "../constants/volume.constant";

const useSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const { setCurrentPlaybackTime, setIsPlaying } = useSoundState();

  useEffect(() => {
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;

      const handleLoadedMetaData = () => {
        timeoutForDelay(() => setDuration(audio.duration));
      };

      const handleTimeUpdate = () => {
        timeoutForDelay(() => setCurrentPlaybackTime(audio.currentTime));
      };

      // listening duration and return cleanup function
      const cleanupLoaded = timeoutForEventListener(
        audio,
        "loadedmetadata",
        handleLoadedMetaData
      );

      // listening current time and return cleanup function
      const cleanupTime = timeoutForEventListener(
        audio,
        "timeupdate",
        handleTimeUpdate
      );

      return () => {
        audio.pause();
        audio.src = "";
        setIsPlaying(false);

        cleanupLoaded();
        cleanupTime();
      };
    }
  }, [url]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const loop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.loop = !audioRef.current.loop;
    }
  }, []);

  const volume = useCallback((value: Volume) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  }, []);

  return {
    play,
    pause,
    stop,
    seek,
    loop,
    volume,
    duration,
  };
};

export type SoundOutputType = ReturnType<typeof useSound>;

export default useSound;
