import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import ItemCard from "../components/item-card.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import { useGetProfileCollectionInfoQuery } from "../hooks/user-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { ProfileCollectionsType } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

const ProfileSectionPage = () => {
  const { fm } = useScopedIntl();
  const { section } = useParams();

  const profileCollectionsSectionFm = fm("profile.collections.section");
  const profileSectionPageFm = fm("profile.section.page");
  const collection = section as ProfileCollectionsType;

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { profileCollectionDocs, isLoading, isFetching, page, setPage } =
    useGetProfileCollectionInfoQuery(collection);
  const { docs, totalDocs } = profileCollectionDocs ?? {};

  return (
    <div
      className={`
        flex
        flex-col
        gap-5
        py-10
        px-6
    `}
    >
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
            className={`
              grid
              ${
                isCollapsed
                  ? `
                    max-xs:grid-cols-1
                    xs:grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                  `
                  : `
                    max-xs:grid-cols-1
                    xs:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                  `
              }
              gap-5
            `}
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
                  <ItemCard
                    to={toProfile}
                    title={title}
                    imageUrl={imageUrl}
                    description={description}
                    className={`
                      bg-neutral-500/15
                      hover:bg-neutral-500/30
                      transition
                    `}
                    tw={{
                      img: `
                        w-full
                        max-xs:min-w-[180px]
                        xs:min-w-[140px]
                        sm:min-w-[120px]
                      `,
                      title: "truncate line-clamp-1 text-ellipsis",
                    }}
                  />
                </AnimationWrapper>
              );
            })}
          </div>

          {/* load loading */}
          <div className={`mt-5`}>
            {isFetching && <Loader loader={{ name: "BeatLoader", size: 12 }} />}
          </div>

          {/* load status */}
          <div
            className={`
              flex
              items-center
              justify-center
              gap-10
            `}
          >
            {/* load more */}
            {totalDocs && totalDocs > docs.length && (
              <button className={`load-btn`} onClick={() => setPage(page + 1)}>
                {profileSectionPageFm("loadMore")}
              </button>
            )}

            {/* load less */}
            {page > 1 && docs.length > 0 && (
              <button className={`load-btn`} onClick={() => setPage(1)}>
                {profileSectionPageFm("loadLess")}
              </button>
            )}
          </div>
        </div>
      ) : (
        <p
          className={`
            text-center
            text-neutral-100/30
          `}
        >
          {profileSectionPageFm("noData")}
        </p>
      )}
    </div>
  );
};

export default ProfileSectionPage;
