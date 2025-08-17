import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongTableList from "../components/song-table-list.component";
import MusicianHeroSection from "../components/musician-hero-section.component";
import MusicianActionPanel from "../components/musician-action-panel.component";
import MusicianRecommendationSection from "../components/musician-recommendation-section.component";
import {
  useGetMusicianByIdQuery,
  useGetRecommendedMusiciansQuery,
} from "../hooks/musician-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import useUserState from "../states/user.state";

const MusicianPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
  const { authUser } = useUserState();
  const { musician } = useGetMusicianByIdQuery(String(id));
  const { recommendedMusicians, isLoading } = useGetRecommendedMusiciansQuery(String(id));

  if (!musician) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs, followers } = musician;

  const noSongYet = songs.length === 0;
  const hasRecommendedMusicians = recommendedMusicians && recommendedMusicians.length > 0;
  const followed = followers.some((follower) => follower === authUser?._id);

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
      <MusicianHeroSection fm={fm} followed={followed} musician={musician} />

      <div
        className={`
          flex
          flex-1
          flex-col
          mt-10
          p-6
          gap-5
          w-full
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
          overflow-y-auto
        `}
      >
        {/* action panel */}
        <MusicianActionPanel fm={fm} followed={followed} musician={musician} />

        {/* song list */}
        <SongTableList
          fm={fm}
          songs={songs}
          paletee={paletee}
          className={`${noSongYet ? "mb-10" : "mb-32"}`}
        />

        {/* recommended musician section */}
        {hasRecommendedMusicians && (
          <MusicianRecommendationSection
            fm={fm}
            musicians={recommendedMusicians}
            isLoading={isLoading}
            className={`mb-8`}
          />
        )}
      </div>
    </div>
  );
};

export default MusicianPage;
