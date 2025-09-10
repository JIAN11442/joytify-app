import SongCardList from "./song-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/types/constants";
import { PaginatedSongsResponse } from "@joytify/types/types";

type HomepageRecommendedSongsProps = {
  fm: ScopedFormatMessage;
  songs: PaginatedSongsResponse;
  isGuest?: boolean;
};

const HomepageRecommendedSongs: React.FC<HomepageRecommendedSongsProps> = ({
  fm,
  songs,
  isGuest = false,
}) => {
  const { docs, totalDocs } = songs;
  const { RECOMMENDED_SONGS } = HomepageSection;

  const recommendedSongsFm = fm(`homepage.section.recommendedSongs`);

  const title = isGuest ? recommendedSongsFm("guest.title") : recommendedSongsFm("title");
  const description = isGuest
    ? recommendedSongsFm("guest.description")
    : recommendedSongsFm("description");

  return (
    <HomepageSectionList
      fm={fm}
      title={title}
      description={description}
      pagination={{
        to: `/section/${RECOMMENDED_SONGS}`,
        count: docs.length,
        total: totalDocs,
      }}
    >
      <SongCardList
        songs={docs}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ card: "card-size--base" }}
      />
    </HomepageSectionList>
  );
};

export default HomepageRecommendedSongs;
