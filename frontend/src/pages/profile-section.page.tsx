import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import ItemCard from "../components/item-card.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import { useGetProfileCollectionInfoQuery } from "../hooks/user-query.hook";
import { ProfileCollectionsType } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";

const ProfileSectionPage = () => {
  const { section } = useParams();
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
      <h1 className={`text-3xl font-bold`}>
        {collection.charAt(0).toUpperCase() + collection.slice(1)}
      </h1>

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
            {docs.map((doc) => {
              const { _id, title, imageUrl } = doc;
              const description = Array.isArray(doc.description)
                ? doc.description[0]
                : doc.description;
              return (
                <AnimationWrapper
                  key={_id}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                >
                  <ItemCard
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
              <button
                className={`
                  mt-5
                  text-sm
                  text-neutral-100/30
                  hover:text-neutral-100/50
                  hover:scale-105
                  transition
                `}
                onClick={() => setPage(page + 1)}
              >
                Load more
              </button>
            )}

            {/* load less */}
            {page > 1 && docs.length > 0 && (
              <button
                className={`
                  mt-5
                  text-sm
                  text-neutral-100/30
                  hover:text-neutral-100/50
                  hover:scale-105
                  transition
                `}
                onClick={() => setPage(1)}
              >
                Load less
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
          No data
        </p>
      )}
    </div>
  );
};

export default ProfileSectionPage;
