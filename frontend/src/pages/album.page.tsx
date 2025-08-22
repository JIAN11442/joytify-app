import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongTableList from "../components/song-table-list.component";
import AlbumHeroSection from "../components/album-hero-section.component";
import AlbumActionPanel from "../components/album-action-panel.component";
import AlbumRecommendationSection from "../components/album-recommendation-section.component";
import { useGetAlbumByIdQuery, useGetRecommendedAlbumsQuery } from "../hooks/album-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

const AlbumPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
  const { album } = useGetAlbumByIdQuery(String(id));
  const { recommendedAlbums, isLoading } = useGetRecommendedAlbumsQuery(String(id));

  if (!album) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = album;

  const noSongYet = songs.length === 0;
  const hasRecommendedAlbums = recommendedAlbums && recommendedAlbums.length > 0;

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
      <AlbumHeroSection fm={fm} album={album} />

      {/* content section */}
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
        <AlbumActionPanel fm={fm} album={album} />

        {/* song list */}
        <SongTableList
          fm={fm}
          songs={songs}
          paletee={paletee}
          className={`${noSongYet ? "mb-10" : "mb-32"}`}
        />

        {/* album recommendation section */}
        {hasRecommendedAlbums && (
          <AlbumRecommendationSection
            fm={fm}
            albums={recommendedAlbums}
            isLoading={isLoading}
            className={`mb-8`}
          />
        )}
      </div>
    </div>
  );
};

export default AlbumPage;
