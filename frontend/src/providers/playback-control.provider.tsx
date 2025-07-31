import { isEqual } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import usePlaybackControl from "../hooks/playback-control.hook";
import { useRecordPlaybackLogMutation } from "../hooks/playback-mutate.hook";
import { useUpdateUserPreferencesMutation } from "../hooks/cookie-mutate.hook";
import { LoopMode, PlaybackStateOptions } from "@joytify/shared-types/constants";
import usePlaybackControlState from "../states/playback-control.state";
import useCookieState from "../states/cookie.state";
import { timeoutForEventListener } from "../lib/timeout.lib";
import { getMusicAudioInstance } from "../lib/music-audio.lib";
import { initializeNotificationAudioInstance } from "../lib/notification-audio.lib";

type PlaybackControlProps = {
  children: React.ReactNode;
};

const PlaybackControlProvider: React.FC<PlaybackControlProps> = ({ children }) => {
  const audioSrcRef = useRef<string>("");
  const audioCurrentTimeRef = useRef<number>(0);
  const playbackTimeRef = useRef<number>(0);
  const accumulatePlaybackTimeRef = useRef<number>(0);

  const { seekAudio, resume, switchSong } = usePlaybackControl();
  const {
    isPlaying,
    playlistSongs,
    playbackQueue,
    loopMode,
    isShuffle,
    audioVolume,
    initializedFormCookie,
    setIsPlaying,
    setProgressTime,
    setPlaybackTime,
  } = usePlaybackControlState();
  const { refactorCookiePlayer, setRefactorCookiePlayer } = useCookieState();

  const { mutate: recordPlaybackLogFn } = useRecordPlaybackLogMutation();
  const { mutate: updateUserPreferencesFn } = useUpdateUserPreferencesMutation();

  const { TRACK, PLAYLIST } = LoopMode;
  const { COMPLETED, PLAYING } = PlaybackStateOptions;

  const musicAudio = getMusicAudioInstance();

  const player = useMemo(() => {
    return {
      shuffle: isShuffle,
      loop: loopMode,
      volume: audioVolume,
      playlistSongs: playlistSongs,
      playbackQueue: playbackQueue,
    };
  }, [isShuffle, loopMode, audioVolume, playbackQueue, playlistSongs]);

  // audio play ended event
  useEffect(() => {
    const handleEnded = () => {
      if (!musicAudio) return;

      const { queue, currentIndex } = playbackQueue;
      const currentSong = queue[currentIndex];

      // record first
      if (isPlaying) {
        recordPlaybackLogFn({
          songId: currentSong._id,
          duration: accumulatePlaybackTimeRef.current,
          state: COMPLETED,
        });
      }

      // reset accumulated time
      accumulatePlaybackTimeRef.current = 0;

      switch (true) {
        // if track mode, seek to 0 and resume
        case loopMode === TRACK:
          seekAudio(0);
          resume();
          break;

        // if shuffle or playlist mode, play next song
        case isShuffle || loopMode === PLAYLIST:
          switchSong("next");
          break;

        // if no shuffle and loop mode, just reset
        default:
          musicAudio.currentTime = 0;
          setIsPlaying(false);
      }
    };

    musicAudio.addEventListener("ended", handleEnded);

    return () => {
      musicAudio.removeEventListener("ended", handleEnded);
    };
  }, [musicAudio, loopMode, isShuffle, playbackQueue, isPlaying]);

  // audio time update event
  useEffect(() => {
    const { queue, currentIndex } = playbackQueue;
    const currentSong = queue[currentIndex];

    const handleTimeUpdate = () => {
      if (!musicAudio || !currentSong) return;

      const audioCurrentTime = musicAudio.currentTime;
      const timeInterval = audioCurrentTime - audioCurrentTimeRef.current;
      const validTimeInterval =
        timeInterval > 0.3 ? playbackTimeRef.current : timeInterval < 0 ? 0 : timeInterval;

      audioCurrentTimeRef.current = audioCurrentTime;
      playbackTimeRef.current = validTimeInterval;
      accumulatePlaybackTimeRef.current += validTimeInterval;

      setProgressTime(audioCurrentTime);
      setPlaybackTime(accumulatePlaybackTimeRef.current);
    };

    audioSrcRef.current = musicAudio.src;
    musicAudio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      if (
        isPlaying &&
        musicAudio.src &&
        audioSrcRef.current &&
        musicAudio.src !== audioSrcRef.current &&
        currentSong &&
        audioCurrentTimeRef.current !== currentSong.duration
      ) {
        recordPlaybackLogFn({
          songId: currentSong._id,
          duration: accumulatePlaybackTimeRef.current,
          state: PLAYING,
        });
      }

      audioCurrentTimeRef.current = 0;
      playbackTimeRef.current = 0;
      accumulatePlaybackTimeRef.current = 0;

      musicAudio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [musicAudio.src, playbackQueue, isPlaying]);

  // update player cookie while state changes
  useEffect(() => {
    if (!initializedFormCookie || isEqual(player, refactorCookiePlayer)) return;

    const refactorPlayer = {
      ...player,
      playlistSongs: player?.playlistSongs?.map((song) => song._id),
      playbackQueue: {
        ...player.playbackQueue,
        queue: player.playbackQueue.queue.map((s) => s._id),
      },
    };

    setRefactorCookiePlayer(player);
    updateUserPreferencesFn({ player: refactorPlayer });
  }, [initializedFormCookie, refactorCookiePlayer, player]);

  // To bypass browser's autoplay restrictions, we must unlock the notification audio
  // by playing it (even silently) after a user interaction (click or keydown).
  // This ensures notification sounds can be played automatically later (e.g., via WebSocket).
  // This useEffect only needs to run once on app initialization.
  useEffect(() => {
    let cleanupClick: (() => void) | null = null;
    let cleanupKeydown: (() => void) | null = null;

    const unlockAudio = async () => {
      try {
        await initializeNotificationAudioInstance();

        // remove event listener immediately after initialize
        // cause it just need to be called once to unlock audio
        cleanupClick?.();
        cleanupKeydown?.();
      } catch (error) {
        console.warn("Failed to unlock audio:", error);
      }
    };

    cleanupClick = timeoutForEventListener(window, "click", unlockAudio);
    cleanupKeydown = timeoutForEventListener(window, "keydown", unlockAudio);

    return () => {
      cleanupClick?.();
      cleanupKeydown?.();
    };
  }, []);

  return <>{children}</>;
};

export default PlaybackControlProvider;
