import { useParams } from "react-router-dom";
import {
  CircleCardListSkeleton,
  GridCardListSkeleton,
} from "../components/skeleton-loading.component";
import SongCardList from "../components/song-card-list.component";
import AlbumCardList from "../components/album-card-list.component";
import LabelCardList from "../components/label-card-list.component";
import MusicianCardList from "../components/musician-card-list.component";
import { useScopedIntl } from "../hooks/intl.hook";
import {
  useGetPopularMusiciansQuery,
  useGetRecentlyPlayedSongsQuery,
  useGetRecommendedAlbumsQuery,
  useGetRecommendedLabelsQuery,
  useGetRecommendedSongsQuery,
} from "../hooks/homepage-query.hook";
import { HomepageSection, LabelOptions } from "@joytify/shared-types/constants";

const { GENRE, TAG } = LabelOptions;
const {
  POPULAR_MUSICIANS,
  RECENTLY_PLAYED_SONGS,
  RECOMMENDED_SONGS,
  RECOMMENDED_ALBUMS,
  RECOMMENDED_GENRES,
  RECOMMENDED_TAGS,
} = HomepageSection;

const LOAD_PAGE = 3;

const PopularMusiciansSection = () => {
  const { popularMusicians, isLoading } = useGetPopularMusiciansQuery(LOAD_PAGE);

  if (isLoading) return <CircleCardListSkeleton count={5} />;
  if (!popularMusicians) return null;

  const { docs } = popularMusicians;

  return <MusicianCardList musicians={docs} />;
};

const RecentlyPlayedSongsSection = () => {
  const { recentlyPlayedSongs, isLoading } = useGetRecentlyPlayedSongsQuery(LOAD_PAGE);

  if (isLoading) return <GridCardListSkeleton count={5} />;
  if (!recentlyPlayedSongs) return null;

  const { docs } = recentlyPlayedSongs;

  return <SongCardList songs={docs} />;
};

const RecommendedSongsSection = () => {
  const { recentlyPlayedSongs } = useGetRecentlyPlayedSongsQuery(LOAD_PAGE);
  const { recommendedSongs, isLoading } = useGetRecommendedSongsQuery({
    initialPage: LOAD_PAGE,
    songIds: recentlyPlayedSongs?.docs.map((song) => song._id) || undefined,
  });

  if (isLoading) return <GridCardListSkeleton count={5} />;
  if (!recommendedSongs) return null;

  const { docs } = recommendedSongs;

  return <SongCardList songs={docs} />;
};

const RecommendedAlbumsSection = () => {
  const { recentlyPlayedSongs } = useGetRecentlyPlayedSongsQuery(LOAD_PAGE);
  const { recommendedAlbums, isLoading } = useGetRecommendedAlbumsQuery({
    initialPage: LOAD_PAGE,
    songIds: recentlyPlayedSongs?.docs.map((song) => song._id) || undefined,
  });

  if (isLoading) return <GridCardListSkeleton count={5} />;
  if (!recommendedAlbums) return null;

  const { docs } = recommendedAlbums;

  return <AlbumCardList albums={docs} />;
};

const RecommendedGenresSection = () => {
  const { recommendedLabels: recommendedGenres, isLoading } = useGetRecommendedLabelsQuery(
    GENRE,
    LOAD_PAGE
  );

  if (isLoading) return <GridCardListSkeleton count={5} />;
  if (!recommendedGenres) return null;

  const { docs } = recommendedGenres;

  return <LabelCardList labels={docs} />;
};

const RecommendedTagsSection = () => {
  const { recommendedLabels: recommendedTags, isLoading } = useGetRecommendedLabelsQuery(
    TAG,
    LOAD_PAGE
  );

  if (isLoading) return <GridCardListSkeleton count={5} />;
  if (!recommendedTags) return null;

  const { docs } = recommendedTags;

  return <LabelCardList labels={docs} />;
};

const HomeSectionPage = () => {
  const { type } = useParams();
  const { fm } = useScopedIntl();

  const homepageSectionFm = fm(`homepage.section.${type}`);

  const SectionContentList = () => {
    switch (type) {
      case POPULAR_MUSICIANS:
        return <PopularMusiciansSection />;
      case RECENTLY_PLAYED_SONGS:
        return <RecentlyPlayedSongsSection />;
      case RECOMMENDED_SONGS:
        return <RecommendedSongsSection />;
      case RECOMMENDED_ALBUMS:
        return <RecommendedAlbumsSection />;
      case RECOMMENDED_GENRES:
        return <RecommendedGenresSection />;
      case RECOMMENDED_TAGS:
        return <RecommendedTagsSection />;
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className={`page-container`}>
      <p className={`text-2xl font-bold`}>{homepageSectionFm("title")}</p>
      <SectionContentList />
    </div>
  );
};

export default HomeSectionPage;
