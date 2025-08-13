import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongTableList from "../components/song-table-list.component";
import PlaylistHeroSection from "../components/playlist-hero-section.component";
import PlaylistActionPanel from "../components/playlist-action-panel.component";
import { useGetPlaylistByIdQuery } from "../hooks/playlist-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

const PlaylistPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
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
      className={`h-full pt-10 overflow-x-hidden rounded-b-none`}
    >
      {/* hero section */}
      <PlaylistHeroSection fm={fm} playlist={playlist} />

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
        <PlaylistActionPanel fm={fm} playlist={playlist} />

        {/* song list */}
        <SongTableList fm={fm} songs={songs} paletee={paletee} />
      </div>
    </div>
  );
};

export default PlaylistPage;
