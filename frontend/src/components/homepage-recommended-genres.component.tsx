import LabelCardList from "./label-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/shared-types/constants";
import { PaginatedLabelResponse } from "@joytify/shared-types/types";

type HomepageRecommendedGenresProps = {
  fm: ScopedFormatMessage;
  genres: PaginatedLabelResponse;
};

const HomepageRecommendedGenres: React.FC<HomepageRecommendedGenresProps> = ({ fm, genres }) => {
  const { docs, totalDocs } = genres;
  const { RECOMMENDED_GENRES } = HomepageSection;

  const recommendedGenresFm = fm(`homepage.section.recommendedGenres`);

  return (
    <HomepageSectionList
      fm={fm}
      title={recommendedGenresFm("title")}
      description={recommendedGenresFm("description")}
      pagination={{
        to: `/section/${RECOMMENDED_GENRES}`,
        count: docs.length,
        total: totalDocs,
      }}
    >
      <LabelCardList
        labels={docs}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "card-size--base" }}
      />
    </HomepageSectionList>
  );
};

export default HomepageRecommendedGenres;
