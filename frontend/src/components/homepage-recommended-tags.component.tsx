import LabelCardList from "./label-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/shared-types/constants";
import { PaginatedLabelResponse } from "@joytify/shared-types/types";

type HomepageRecommendedTagsProps = {
  fm: ScopedFormatMessage;
  tags: PaginatedLabelResponse;
};

const HomepageRecommendedTags: React.FC<HomepageRecommendedTagsProps> = ({ fm, tags }) => {
  const { docs, totalDocs } = tags;
  const { RECOMMENDED_TAGS } = HomepageSection;

  const recommendedTagsFm = fm(`homepage.section.recommendedTags`);

  return (
    <HomepageSectionList
      fm={fm}
      title={recommendedTagsFm("title")}
      description={recommendedTagsFm("description")}
      pagination={{
        to: `/section/${RECOMMENDED_TAGS}`,
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

export default HomepageRecommendedTags;
