import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongList from "../components/song-list.component";
import AlbumHeroSection from "../components/album-hero-section.component";
import AlbumActionPanel from "../components/album-action-panel.component";
import { useGetAlbumByIdQuery } from "../hooks/album-query.hook";

const AlbumPage = () => {
  const { id } = useParams();
  const { album } = useGetAlbumByIdQuery(String(id));

  if (!album) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = album;

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
      <AlbumHeroSection album={album} />

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
        <AlbumActionPanel album={album} />

        {/* song list */}
        <SongList songs={songs} paletee={paletee} />
      </div>
    </div>
  );
};

export default AlbumPage;
