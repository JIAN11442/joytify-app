import { useCallback, useEffect } from "react";
import usePlayerState from "../states/player.state";
import useSoundState from "../states/sound.state";
import { refactorResSong } from "../constants/axios-response.constant";

const useOnPlay = (songs: refactorResSong[]) => {
  const { setActiveSongId, setSongIds, setOnPlay, setShuffleSongIds } =
    useSoundState();
  const { isShuffle } = usePlayerState();

  // shuffle song ids function
  const shuffleSongIds = useCallback(
    (id: string) => {
      const songIds = songs.map((song) => song._id);

      songIds.splice(songIds.indexOf(id), 1);

      const shuffleSongIds = [id, ...songIds.sort(() => Math.random() - 0.5)];

      setSongIds(shuffleSongIds);
    },
    [isShuffle, songs]
  );

  // on play target id song
  const onPlay = useCallback(
    (id: string) => {
      setActiveSongId(id);

      // for to previous or next button
      if (isShuffle) {
        shuffleSongIds(id);
      } else {
        setSongIds(songs.map((song) => song._id));
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
