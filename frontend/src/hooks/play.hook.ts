import { useCallback, useEffect } from "react";
import usePlayerState from "../states/player.state";
import useSoundState from "../states/sound.state";
import { RefactorSongResponse } from "@joytify/shared-types/types";

const useOnPlay = (songs?: RefactorSongResponse[]) => {
  const { isShuffle } = usePlayerState();
  const { setActiveSongId, setSongIds, setOnPlay, setShuffleSongIds } = useSoundState();

  // shuffle song ids function
  const shuffleSongIds = useCallback(
    (id: string) => {
      if (songs) {
        const songIds = songs.map((song) => song._id).filter((songId) => songId !== id);
        const shuffleSongIds = [id, ...songIds.sort(() => Math.random() - 0.5)];

        setSongIds(shuffleSongIds);
      }
    },
    [isShuffle, songs]
  );

  // on play target id song
  const onPlay = useCallback(
    (id: string) => {
      if (songs) {
        setActiveSongId(id);

        // for to previous or next button
        if (isShuffle) {
          shuffleSongIds(id);
        } else {
          setSongIds(songs.map((song) => song._id));
        }
      }
    },
    [songs, isShuffle]
  );

  useEffect(() => {
    setOnPlay(onPlay);
  }, [onPlay]);

  useEffect(() => {
    setShuffleSongIds(shuffleSongIds);
  }, [shuffleSongIds]);

  return { onPlay, shuffleSongIds };
};

export default useOnPlay;
