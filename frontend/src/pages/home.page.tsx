import useOnPlay from "../hooks/play.hook";
import { RefactorResSong } from "../constants/axios-response.constant";
import useSoundState from "../states/sound.state";
import { useAllSongs } from "../hooks/song.hook";

const HomePage = () => {
  const { songs } = useAllSongs();
  const { onPlay } = useOnPlay(songs!);
  const { activeSongId, isPlaying, sound } = useSoundState();

  const handlePlaySong = (song: RefactorResSong) => {
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
