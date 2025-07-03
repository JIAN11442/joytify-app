import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongHeroSection from "../components/song-hero-section.component";
import SongActionPanel from "../components/song-action-panel.component";
import SongCommentList from "../components/song-comment-list.component";
import SongProfileDetails from "../components/song-profile-details.component";
import { useGetSongByIdQuery } from "../hooks/song-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import useUserState from "../states/user.state";

const SongPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
  const { song } = useGetSongByIdQuery(String(id));

  const { authUser } = useUserState();

  if (!song) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { creator, paletee } = song;
  const isCreator = creator === authUser?._id;

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
        min-h-screen
        pt-10
        rounded-b-none
      `}
    >
      {/* hero section */}
      <SongHeroSection song={song} editable={isCreator} />

      <div
        className={`
          flex
          flex-col
          mt-10
          mb-5
          w-full
          h-full
          p-6
          gap-5
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
        `}
      >
        {/* actions panel */}
        <SongActionPanel fm={fm} song={song} editable={isCreator} />

        {/* song details */}
        <SongProfileDetails song={song} />

        {/* comments */}
        <SongCommentList fm={fm} song={song} className={`mt-5`} />
      </div>
    </div>
  );
};

export default SongPage;
