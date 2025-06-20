import { useGetAllSongsQuery } from "../hooks/song-query.hook";
import usePlaybackControl from "../hooks/playback-control.hook";
import { Queue } from "@joytify/shared-types/types";

const HomePage = () => {
  const { songs } = useGetAllSongsQuery();
  const { playSong } = usePlaybackControl();

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
        songs.map((song, index) => {
          const { _id: songId, title } = song;

          const handlePlaySong = (index: number) => {
            return playSong({
              playlistSongs: songs,
              queue: songs as unknown as Queue,
              currentIndex: index,
              currentPlaySongId: songId,
            });
          };

          return (
            <button
              key={songId}
              onClick={() => handlePlaySong(index)}
              className={`
                flex
                hover:text-blue-400
              `}
            >
              <p>{title}</p>
            </button>
          );
        })
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HomePage;
