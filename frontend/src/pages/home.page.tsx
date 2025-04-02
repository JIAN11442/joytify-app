import useOnPlay from "../hooks/play.hook";
import { useGetSongsQuery } from "../hooks/song-query.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSoundState from "../states/sound.state";

const HomePage = () => {
  const { songs } = useGetSongsQuery();
  const { onPlay } = useOnPlay(songs);
  const { activeSongId, isPlaying, sound } = useSoundState();

  const handlePlaySong = (song: RefactorSongResponse) => {
    if (!sound || song._id !== activeSongId) {
      onPlay(song._id);
    } else {
      if (isPlaying) {
        sound?.pause();
      } else {
        sound?.play();
      }
    }
  };

  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        p-6
      `}
    >
      {songs ? (
        songs.map((song) => (
          <button
            key={song.title}
            onClick={() => handlePlaySong(song)}
            className={`
              flex
              hover:text-blue-400
            `}
          >
            <p>{song.title}</p>
          </button>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HomePage;
