import HomepageRecentlyPlayed from "../components/homepage-recently-played.component";
import HomepageRecommendedSongs from "../components/homepage-recommended-songs.component";
import HomepagePopularMusicians from "../components/homepage-popular-musicians.component";
import HomepageRecommendedAlbums from "../components/homepage-recommended-albums.component";
import HomepageRecommendedGenres from "../components/homepage-recommended-genres.component";
import HomepageRecommendedTags from "../components/homepage-recommended-tags.component";
import { GridCardListSectionSkeleton } from "../components/skeleton-loading.component";
import {
  useGetPopularMusiciansQuery,
  useGetRecentlyPlayedSongsQuery,
  useGetRecommendedAlbumsQuery,
  useGetRecommendedLabelsQuery,
  useGetRecommendedSongsQuery,
} from "../hooks/homepage-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { LabelOptions } from "@joytify/shared-types/constants";
import useUserState from "../states/user.state";

const HomePage = () => {
  const { fm } = useScopedIntl();
  const { authUser } = useUserState();

  const { GENRE, TAG } = LabelOptions;

  const { popularMusicians, isLoading: musiciansLoading } = useGetPopularMusiciansQuery();
  const { recentlyPlayedSongs, isLoading: recentSongsLoading } = useGetRecentlyPlayedSongsQuery();

  const recentlySongIds = recentlyPlayedSongs?.docs.map((song) => song._id) || [];
  const query = { songIds: recentlySongIds.length > 0 ? recentlySongIds : undefined };

  const { recommendedSongs, isLoading: songsLoading } = useGetRecommendedSongsQuery(query);
  const { recommendedAlbums, isLoading: albumsLoading } = useGetRecommendedAlbumsQuery(query);
  const { recommendedLabels: recommendedTags, isLoading: tagsLoading } =
    useGetRecommendedLabelsQuery(TAG);
  const { recommendedLabels: recommendedGenres, isLoading: genresLoading } =
    useGetRecommendedLabelsQuery(GENRE);

  const isGuest = !authUser?._id;

  const isLoading =
    musiciansLoading ||
    songsLoading ||
    recentSongsLoading ||
    albumsLoading ||
    tagsLoading ||
    genresLoading;

  const showRecentlyPlayed = recentlyPlayedSongs && recentlyPlayedSongs.docs.length > 0;
  const showPopularMusicians = popularMusicians && popularMusicians.docs.length > 0;
  const showRecommendedSongs = recommendedSongs && recommendedSongs.docs.length > 0;
  const showRecommendedAlbums = recommendedAlbums && recommendedAlbums.docs.length > 0;
  const showRecommendedTags = recommendedTags && recommendedTags.docs.length > 0;
  const showRecommendedGenres = recommendedGenres && recommendedGenres.docs.length > 0;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          rgb(243 244 246 / 0.05) 0%,
          #171717 20%
        )`,
      }}
      className={`page-container`}
    >
      {isLoading ? (
        <GridCardListSectionSkeleton sectionCount={4} listCount={6} showDescription />
      ) : (
        <div className={`flex flex-col gap-10`}>
          {/* guest recommended songs */}
          {showRecommendedSongs && isGuest && (
            <HomepageRecommendedSongs fm={fm} songs={recommendedSongs} isGuest={isGuest} />
          )}

          {showRecentlyPlayed && <HomepageRecentlyPlayed fm={fm} songs={recentlyPlayedSongs} />}
          {showPopularMusicians && (
            <HomepagePopularMusicians fm={fm} musicians={popularMusicians} />
          )}

          {/* user recommended songs */}
          {showRecommendedSongs && !isGuest && (
            <HomepageRecommendedSongs fm={fm} songs={recommendedSongs} />
          )}

          {showRecommendedAlbums && (
            <HomepageRecommendedAlbums fm={fm} albums={recommendedAlbums} />
          )}
          {showRecommendedTags && <HomepageRecommendedTags fm={fm} tags={recommendedTags} />}
          {showRecommendedGenres && (
            <HomepageRecommendedGenres fm={fm} genres={recommendedGenres} />
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
