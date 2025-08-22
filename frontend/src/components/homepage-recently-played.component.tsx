import SongCardList from "./song-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/shared-types/constants";
import { PaginatedSongsResponse } from "@joytify/shared-types/types";

type HomepageRecentlyPlayedProps = {
  fm: ScopedFormatMessage;
  songs: PaginatedSongsResponse;
};

const HomepageRecentlyPlayed: React.FC<HomepageRecentlyPlayedProps> = ({ fm, songs }) => {
  const { docs, totalDocs } = songs;
  const { RECENTLY_PLAYED_SONGS } = HomepageSection;

  const recentlyPlayedFm = fm(`homepage.section.recentlyPlayedSongs`);

  return (
    <HomepageSectionList
      fm={fm}
      title={recentlyPlayedFm("title")}
      description={recentlyPlayedFm("description")}
      pagination={{
        to: `/section/${RECENTLY_PLAYED_SONGS}`,
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

export default HomepageRecentlyPlayed;
