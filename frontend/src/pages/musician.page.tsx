import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongList from "../components/song-list.component";
import MusicianHeroSection from "../components/musician-hero-section.component";
import MusicianActionPanel from "../components/musician-action-panel.component";
import { useGetMusicianByIdQuery } from "../hooks/musician-query.hook";

const MusicianPage = () => {
  const { id } = useParams();
  const { musician } = useGetMusicianByIdQuery(String(id));

  if (!musician) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = musician;

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
      <MusicianHeroSection musician={musician} />

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
        <MusicianActionPanel musician={musician} />

        {/* song list */}
        <SongList songs={songs} paletee={paletee} />
      </div>
    </div>
  );
};

export default MusicianPage;
