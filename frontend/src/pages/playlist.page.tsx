import { useParams } from "react-router-dom";

import Loader from "../components/loader.component";
import SongList from "../components/song-list.component";
import PlaylistHeroSection from "../components/playlist-hero-section.component";
import PlaylistActionPanel from "../components/playlist-action-panel.component";
import { useGetPlaylistByIdQuery } from "../hooks/playlist-query.hook";

const PlaylistPage = () => {
  const { id } = useParams();
  const { playlist } = useGetPlaylistByIdQuery(String(id));

  if (!playlist) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = playlist;

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
      {/* hero section */}
      <PlaylistHeroSection playlist={playlist} />

      {/* content section */}
      <div
        className={`
          flex
          flex-col
          mt-10
          p-6
          gap-5
          w-full
          h-full
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
          overflow-y-auto
        `}
      >
        {/* action panel */}
        <PlaylistActionPanel playlist={playlist} />

        {/* song list */}
        <SongList songs={songs} paletee={paletee} />
      </div>
    </div>
  );
};

export default PlaylistPage;
