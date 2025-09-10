import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PaginationControl from "../components/pagination-control.component";
import ProfileCollectionCard from "../components/profile-collection-card.component";
import { useGetProfileCollectionInfoQuery } from "../hooks/user-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { ProfileCollectionsType } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";

const ProfileSectionPage = () => {
  const { fm } = useScopedIntl();
  const { section } = useParams();

  const profileSectionPageFm = fm("profile.section.page");
  const profileCollectionsSectionFm = fm("profile.collections.section");
  const collection = section as ProfileCollectionsType;

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { profileCollectionDocs, isLoading, isFetching, page, setPage } =
    useGetProfileCollectionInfoQuery(collection);
  const { docs, totalDocs } = profileCollectionDocs ?? {};

  return (
    <div className={`page-container`}>
      {/* Title */}
      <h1 className={`text-3xl font-bold`}>{profileCollectionsSectionFm(collection)}</h1>

      {/* Content */}
      {isLoading ? (
        <Loader loader={{ name: "ClipLoader" }} />
      ) : docs && docs.length > 0 ? (
        <div
          className={`
            flex
            flex-col
            gap-5
          `}
        >
          {/* content */}
          <div
            className={`${
              isCollapsed ? "card-list-arrange--collapsed" : "card-list-arrange--expanded"
            }`}
          >
            {docs.map((doc, index) => {
              const { _id, title, imageUrl } = doc;
              const description = Array.isArray(doc.description)
                ? doc.description[0]
                : doc.description;

              const toProfile =
                collection === "following"
                  ? `/artist/${_id}`
                  : `/${collection.endsWith("s") ? collection.slice(0, -1) : collection}/${_id}`;

              return (
                <AnimationWrapper key={_id} transition={{ duration: 0.5, delay: 0.1 * index }}>
                  <ProfileCollectionCard
                    to={toProfile}
                    title={title}
                    imageUrl={imageUrl}
                    description={description}
                    className={`grid-card-wrapper--background`}
                    tw={{ title: "truncate line-clamp-1 text-ellipsis" }}
                  />
                </AnimationWrapper>
              );
            })}
          </div>

          {/* pagination */}
          <PaginationControl
            fm={fm}
            totalDocs={totalDocs || 0}
            currentPage={page}
            currentDocsLength={docs.length}
            pageControl={{ page, setPage }}
            className={`mt-5`}
          >
            {isFetching && <Loader loader={{ name: "BeatLoader", size: 12 }} />}
          </PaginationControl>
        </div>
      ) : (
        <p className={`text-center text-neutral-100/30`}>{profileSectionPageFm("noData")}</p>
      )}
    </div>
  );
};

export default ProfileSectionPage;
