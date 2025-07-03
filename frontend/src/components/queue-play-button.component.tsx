import { useCallback, useMemo } from "react";
import PlayButton from "./play-button.component";
import usePlaybackControl from "../hooks/playback-control.hook";
import { Queue, RefactorSongResponse } from "@joytify/shared-types/types";
import usePlaybackControlState from "../states/playback-control.state";

type QueuePlayButtonProps = {
  songs: RefactorSongResponse[];
};

const QueuePlayButton: React.FC<QueuePlayButtonProps> = ({ songs }) => {
  const { isPlaying } = usePlaybackControlState();
  const { audioSong, playSong } = usePlaybackControl();

  const handlePlayQueueSongs = useCallback(() => {
    const idx = songs.findIndex((s) => s._id === audioSong?._id);
    const currentIndex = idx !== -1 ? idx : 0;

    playSong({
      playlistSongs: songs,
      queue: songs as unknown as Queue,
      currentIndex,
      currentPlaySongId: songs[currentIndex]._id,
    });
  }, [audioSong, songs, playSong]);

  const playedSongExistInArtist = useMemo(() => {
    return songs && songs.findIndex((s) => s._id === audioSong?._id) !== -1;
  }, [audioSong, songs]);

  return (
    <PlayButton
      onClick={handlePlayQueueSongs}
      isPlaying={playedSongExistInArtist ? isPlaying : false}
    />
  );
};

export default QueuePlayButton;
