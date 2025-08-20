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

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          rgb(243 244 246 / 0.05) 0%,
          #171717 25%
        )`,
      }}
      className={`page-container`}
    >
      {isLoading ? (
        <GridCardListSectionSkeleton sectionCount={4} listCount={5} showDescription />
      ) : (
        <>
          {/* guest recommended songs */}
          {recommendedSongs && isGuest && (
            <HomepageRecommendedSongs fm={fm} songs={recommendedSongs} isGuest={isGuest} />
          )}

          {recentlyPlayedSongs && <HomepageRecentlyPlayed fm={fm} songs={recentlyPlayedSongs} />}
          {popularMusicians && <HomepagePopularMusicians fm={fm} musicians={popularMusicians} />}

          {/* user recommended songs */}
          {recommendedSongs && !isGuest && (
            <HomepageRecommendedSongs fm={fm} songs={recommendedSongs} />
          )}

          {recommendedAlbums && <HomepageRecommendedAlbums fm={fm} albums={recommendedAlbums} />}
          {recommendedTags && <HomepageRecommendedTags fm={fm} tags={recommendedTags} />}
          {recommendedGenres && <HomepageRecommendedGenres fm={fm} genres={recommendedGenres} />}
        </>
      )}
    </div>
  );
};

export default HomePage;
