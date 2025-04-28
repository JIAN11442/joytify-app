import { useParams } from "react-router-dom";

import Loader from "../components/loader.component";
import PlaylistBody from "../components/playlist-body.component";
import PlaylistHeader from "../components/playlist-header.component";
import { useGetPlaylistByIdQuery } from "../hooks/playlist-query.hook";

const PlaylistPage = () => {
  const { id } = useParams();
  const { playlist } = useGetPlaylistByIdQuery(String(id));

  // If any of these data are not available, show loader
  if (!playlist) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee } = playlist;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.vibrant} 0%,
          ${paletee?.darkVibrant} 40%,
          #171717 70%
        )`,
      }}
      className={`
        h-full
        pt-10
        rounded-b-none
        overflow-x-hidden
      `}
    >
      {/* Playlist header */}
      <PlaylistHeader playlist={playlist} />

      {/* Playlist content */}
      <PlaylistBody playlist={playlist} />
    </div>
  );
};

export default PlaylistPage;
