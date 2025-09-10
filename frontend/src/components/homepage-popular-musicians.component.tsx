import MusicianCardList from "./musician-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/types/constants";
import { PaginatedMusicianResponse } from "@joytify/types/types";

type HomepagePopularMusiciansProps = {
  fm: ScopedFormatMessage;
  musicians: PaginatedMusicianResponse;
};

const HomepagePopularMusicians: React.FC<HomepagePopularMusiciansProps> = ({ fm, musicians }) => {
  const { docs, totalDocs } = musicians;
  const { POPULAR_MUSICIANS } = HomepageSection;

  const popularMusiciansFm = fm(`homepage.section.popularMusicians`);

  return (
    <HomepageSectionList
      fm={fm}
      title={popularMusiciansFm("title")}
      description={popularMusiciansFm("description")}
      pagination={{
        to: `/section/${POPULAR_MUSICIANS}`,
        count: docs.length,
        total: totalDocs,
      }}
    >
      <MusicianCardList
        musicians={docs}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "card-size--base" }}
      />
    </HomepageSectionList>
  );
};

export default HomepagePopularMusicians;
