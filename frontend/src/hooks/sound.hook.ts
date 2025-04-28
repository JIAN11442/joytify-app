import { useEffect, useRef, useState, useCallback } from "react";
import { Volume } from "../types/volume.type";
import useSoundState from "../states/sound.state";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";

const useSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(new AbortController());
  const prevAudioCurrentTimeRef = useRef<number>(0);
  const prevGeneratedDurationRef = useRef<number>(0);

  const [duration, setDuration] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  const { setIsPlaying } = useSoundState();

  const resetAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    prevAudioCurrentTimeRef.current = 0;
    prevGeneratedDurationRef.current = 0;
    setDuration(0);
    setTimestamp(0);
    setPlaybackTime(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!url) {
      resetAudio();
      return;
    }

    isMountedRef.current = true;
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleLoadedMetaData = () => {
      timeoutForDelay(() => {
        if (isMountedRef.current) {
          setDuration(audio.duration);
        }
      });
    };

    const handleTimeUpdate = () => {
      if (!isMountedRef.current) return;

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
    const cleanupLoaded = timeoutForEventListener(
      audio,
      "loadedmetadata",
      handleLoadedMetaData,
      abortControllerRef.current.signal
    );

    // listening current time and return cleanup function
    const cleanupTime = timeoutForEventListener(
      audio,
      "timeupdate",
      handleTimeUpdate,
      abortControllerRef.current.signal
    );

    return () => {
      isMountedRef.current = false;
      resetAudio();
      cleanupLoaded();
      cleanupTime();
    };
  }, [url, resetAudio]);

  const play = useCallback(async () => {
    if (!audioRef.current || !isMountedRef.current) return;

    try {
      await audioRef.current.play();

      if (isMountedRef.current) {
        setIsPlaying(true);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.debug("Playback was aborted intentionally");
      } else {
        console.error("Error playing audio:", error);
        resetAudio();
      }
    }
  }, [resetAudio]);

  const pause = useCallback(async () => {
    if (!audioRef.current || !isMountedRef.current) return;

    try {
      audioRef.current.pause();

      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Pause error:", error);
      resetAudio();
    }
  }, [resetAudio]);

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
