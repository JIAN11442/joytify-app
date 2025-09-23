import { isEqual } from "lodash";
import { useCallback } from "react";
import useMusicAudioPlayer from "./music-audio-player.hook";
import { LoopMode } from "@joytify/types/constants";
import {
  Queue,
  AudioVolumeType,
  PlaybackQueueWithObjects,
  RefactorSongResponse,
} from "@joytify/types/types";
import usePlaybackControlState from "../states/playback-control.state";
import { shuffleArray } from "../utils/shuffle-array.util";

interface PlaySongRequest extends PlaybackQueueWithObjects {
  currentPlaySongId?: string;
  seekToInitialBeforePlay?: boolean;
  playlistSongs?: RefactorSongResponse[];
}

const usePlaybackControl = () => {
  const { play, pause, resume, seek, volume } = useMusicAudioPlayer();
  const {
    isShuffle,
    loopMode,
    progressTime,
    playbackTime,
    setPlaylistSongs,
    setPlaybackQueue,
    setIsPlaying,
    setLoopMode,
    setIsShuffle,
    setAudioVolume,
  } = usePlaybackControlState();

  const { NONE, TRACK, PLAYLIST } = LoopMode;

  const getAudioContent = useCallback(() => {
    const playbackControlState = usePlaybackControlState.getState();

    const audioSong = playbackControlState.audioSong;
    const isPlaying = playbackControlState.isPlaying;
    const playlistSongs = playbackControlState.playlistSongs;
    const { queue, currentIndex } = playbackControlState.playbackQueue;

    return { playlistSongs, audioSong, queue, currentIndex, isPlaying };
  }, []);

  const togglePlayback = useCallback(() => {
    const { audioSong, isPlaying } = getAudioContent();

    if (!audioSong) return;

    if (isPlaying) {
      pause();
    } else {
      resume();
    }

    setIsPlaying(!isPlaying);
  }, [getAudioContent, pause, resume]);

  const playSong = useCallback(
    ({
      queue,
      currentIndex,
      playlistSongs,
      currentPlaySongId,
      seekToInitialBeforePlay,
    }: PlaySongRequest) => {
      const { audioSong, queue: audioQueue } = getAudioContent();

      const isSameSong = currentPlaySongId && currentPlaySongId === audioSong?._id;
      const isDifferentPlaylist = !isEqual(playlistSongs, audioQueue);

      if (isSameSong) {
        togglePlayback();

        if (isDifferentPlaylist && playlistSongs) {
          const updatedQueue = (
            isShuffle
              ? [audioSong, ...shuffleArray(playlistSongs.filter((s) => s._id !== audioSong._id))]
              : playlistSongs
          ) as Queue;
          const updatedIndex = updatedQueue.findIndex((s) => s._id === currentPlaySongId);

          setPlaybackQueue({
            queue: updatedQueue,
            currentIndex: updatedIndex,
          });

          setPlaylistSongs(playlistSongs);
        }

        return;
      }

      const songToPlay = queue[currentIndex];
      if (!songToPlay) return;

      play(songToPlay.songUrl, seekToInitialBeforePlay);

      setPlaybackQueue({ queue, currentIndex });
      setIsPlaying(true);

      // store original playlist songs, use to revert while shuffle or loop
      if (playlistSongs) {
        setPlaylistSongs(playlistSongs);
      }
    },
    [isShuffle, getAudioContent, play, togglePlayback]
  );

  const seekAudio = useCallback(
    (time: number) => {
      const { audioSong, isPlaying } = getAudioContent();

      if (!audioSong) return;

      if (!isPlaying) {
        resume();
        setIsPlaying(true);
      }

      seek(time);
    },
    [getAudioContent, seek, resume]
  );

  const switchSong = useCallback(
    (direction: "next" | "prev") => {
      const { audioSong, queue, currentIndex } = getAudioContent();

      if (!audioSong || !queue || queue.length === 0) return;

      if (queue.length === 1) {
        seekAudio(0);
        console.log("只有一首，切換也只要循環播放這一首");
        return;
      }

      const isFirst = currentIndex === 0;
      const isLast = currentIndex === queue.length - 1;
      const needShuffle = isShuffle && (direction === "next" ? isLast : isFirst);

      if (needShuffle) {
        const newQueue = shuffleArray(queue);
        const newCurrentIndex = 0;

        playSong({
          queue: newQueue as Queue,
          currentIndex: newCurrentIndex,
          seekToInitialBeforePlay: true,
        });
        setPlaybackQueue({
          queue: newQueue as Queue,
          currentIndex: newCurrentIndex,
        });

        console.log(
          "switch(shuffle)：",
          newQueue.map((song) => song.title)
        );
      } else {
        const nextIndex =
          direction === "next"
            ? (currentIndex + 1) % queue.length
            : (currentIndex - 1 + queue.length) % queue.length;
        playSong({ queue, currentIndex: nextIndex, seekToInitialBeforePlay: true });

        console.log(
          "switch(normal)：",
          queue.map((song) => song.title),
          audioSong.title
        );
      }
    },
    [isShuffle, getAudioContent, seekAudio, playSong]
  );

  const shuffleSong = useCallback(
    (shuffle: boolean) => {
      const { playlistSongs, audioSong, queue } = getAudioContent();

      if (!audioSong || !playlistSongs || queue.length === 1) return;

      const newQueue = shuffle
        ? [audioSong, ...shuffleArray(queue.filter((song) => song._id !== audioSong._id))]
        : playlistSongs;
      const newCurrentIndex = shuffle
        ? 0
        : playlistSongs.findIndex((song) => song._id === audioSong._id);

      setLoopMode(NONE);
      setIsShuffle(shuffle);
      setPlaybackQueue({
        queue: newQueue as Queue,
        currentIndex: newCurrentIndex,
      });

      console.log(newQueue.map((song) => song.title));
    },
    [getAudioContent]
  );

  const cycleLoop = useCallback(() => {
    const { playlistSongs } = getAudioContent();
    const hasMultipleSongs = playlistSongs && playlistSongs.length > 1;

    const loopCycle = hasMultipleSongs
      ? { [NONE]: TRACK, [TRACK]: PLAYLIST, [PLAYLIST]: NONE }
      : { [NONE]: TRACK, [TRACK]: NONE, [PLAYLIST]: NONE };

    const switchedLoopMode = loopCycle[loopMode];

    if (switchedLoopMode !== NONE && isShuffle) {
      shuffleSong(false);
    }

    setLoopMode(switchedLoopMode);
  }, [loopMode, isShuffle, shuffleSong, getAudioContent]);

  const adjustVolume = useCallback(
    (value: AudioVolumeType) => {
      volume(value);
      setAudioVolume(value);
    },
    [volume]
  );

  const pausePlayback = useCallback(() => {
    pause();
    seek(0); // Reset to beginning without triggering resume
    setIsPlaying(false);
  }, [pause, seek, setIsPlaying]);

  return {
    audioSong: getAudioContent().audioSong,
    progressTime,
    playbackTime,
    playSong,
    togglePlayback,
    seekAudio,
    shuffleSong,
    cycleLoop,
    switchSong,
    adjustVolume,
    resume,
    pausePlayback,
  };
};

export default usePlaybackControl;
