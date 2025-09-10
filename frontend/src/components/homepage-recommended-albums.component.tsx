import AlbumCardList from "./album-card-list.component";
import HomepageSectionList from "./homepage-section-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { HomepageSection } from "@joytify/types/constants";
import { PaginatedAlbumResponse } from "@joytify/types/types";

type HomepageRecommendedAlbumsProps = {
  fm: ScopedFormatMessage;
  albums: PaginatedAlbumResponse;
};

const HomepageRecommendedAlbums: React.FC<HomepageRecommendedAlbumsProps> = ({ fm, albums }) => {
  const { docs, totalDocs } = albums;
  const { RECOMMENDED_ALBUMS } = HomepageSection;

  const recommendedAlbumsFm = fm(`homepage.section.recommendedAlbums`);

  return (
    <HomepageSectionList
      fm={fm}
      title={recommendedAlbumsFm("title")}
      description={recommendedAlbumsFm("description")}
      pagination={{
        to: `/section/${RECOMMENDED_ALBUMS}`,
        count: docs.length,
        total: totalDocs,
      }}
    >
      <AlbumCardList
        albums={docs}
        className={`flex overflow-x-auto hidden-scrollbar`}
        tw={{ cardWrapper: "card-size--base" }}
      />
    </HomepageSectionList>
  );
};

export default HomepageRecommendedAlbums;
