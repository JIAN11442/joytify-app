import { useEffect, useRef, useState, useCallback } from "react";
import { Volume } from "../types/volume.type";
import useSoundState from "../states/sound.state";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";

const useSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevAudioCurrentTimeRef = useRef<number>(0);
  const prevGeneratedDurationRef = useRef<number>(0);

  const [duration, setDuration] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  const { setIsPlaying } = useSoundState();

  useEffect(() => {
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;

      const handleLoadedMetaData = () => {
        timeoutForDelay(() => setDuration(audio.duration));
      };

      const handleTimeUpdate = () => {
        const audioCurrentTime = audio.currentTime;
        const duration = audioCurrentTime - prevAudioCurrentTimeRef.current;
        const generatedDuration =
          duration > 0.3 ? prevGeneratedDurationRef.current : duration < 0 ? 0 : duration;

        timeoutForDelay(() => {
          setTimestamp(audioCurrentTime);
          setPlaybackTime((prev) => (audioCurrentTime === 0 ? 0 : prev + generatedDuration));

          prevAudioCurrentTimeRef.current = audioCurrentTime;
          prevGeneratedDurationRef.current = generatedDuration;
        });
      };

      // listening duration and return cleanup function
      const cleanupLoaded = timeoutForEventListener(audio, "loadedmetadata", handleLoadedMetaData);

      // listening current time and return cleanup function
      const cleanupTime = timeoutForEventListener(audio, "timeupdate", handleTimeUpdate);

      return () => {
        audio.pause();
        audio.src = "";
        setIsPlaying(false);
        setDuration(0);
        setTimestamp(0);
        setPlaybackTime(0);

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
    timestamp,
    playbackTime,
  };
};

export type SoundOutputType = ReturnType<typeof useSound>;

export default useSound;
