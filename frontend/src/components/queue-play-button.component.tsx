import { isEqual } from "lodash";
import { twMerge } from "tailwind-merge";
import { useCallback, useEffect, useMemo } from "react";
import PlayButton from "./play-button.component";
import usePlaybackControl from "../hooks/playback-control.hook";
import { Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";

type QueuePlayButtonProps = {
  songs: RefactorSongResponse[];
  showOnHover?: boolean;
  onQueueMatchingChange?: (isQueueMatching: boolean) => void;
  className?: string;
};

const QueuePlayButton: React.FC<QueuePlayButtonProps> = ({
  songs,
  showOnHover = false,
  onQueueMatchingChange,
  className,
}) => {
  const { playbackQueue, isPlaying } = usePlaybackControlState();
  const { audioSong, playSong } = usePlaybackControl();

  const handlePlayQueueSongs = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const idx = songs.findIndex((s) => s._id === audioSong?._id);
      const currentIndex = idx !== -1 ? idx : 0;

      playSong({
        playlistSongs: songs,
        queue: songs as unknown as Queue,
        currentIndex,
        currentPlaySongId: songs[currentIndex]._id,
      });
    },
    [audioSong, songs, playSong]
  );

  const isQueueMatching = useMemo(() => {
    const queueSongIds = playbackQueue.queue.map((song) => song._id);
    const songIds = songs.map((song) => song._id);

    return isEqual(queueSongIds, songIds);
  }, [playbackQueue, songs]);

  const isPlayingSongInList = useMemo(() => {
    return songs && songs.findIndex((s) => s._id === audioSong?._id) !== -1;
  }, [audioSong, songs]);

  useEffect(() => {
    onQueueMatchingChange?.(isQueueMatching);
  }, [isQueueMatching, onQueueMatchingChange]);

  return (
    <PlayButton
      onClick={handlePlayQueueSongs}
      isPlaying={isQueueMatching && isPlayingSongInList ? isPlaying : false}
      className={twMerge(
        `
          ${
            showOnHover &&
            ` queue-playbtn--base 
              ${isQueueMatching ? "queue-playbtn--active" : "queue-playbtn--floating"}
            `
          }
        `,
        className
      )}
    />
  );
};

export default QueuePlayButton;
