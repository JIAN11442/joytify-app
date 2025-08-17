import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { ProfileDocs } from "@joytify/shared-types/types";
import ProfileCollectionCard from "./profile-collection-card.component";

type CollectionCardListProps = {
  title?: { content: string; progress: boolean };
  collectionKey: string;
  collectionDocs: ProfileDocs[];
  collectionRoute: string;
  pagination: { to: string; count: number; total: number; label: string };
  className?: string;
  tw?: {
    title?: string;
    list?: string;
  };
};

const ProfileCollectionCardList: React.FC<CollectionCardListProps> = ({
  title,
  collectionKey,
  collectionDocs,
  collectionRoute,
  pagination,
  className,
  tw,
}) => {
  const { content, progress } = title ?? {};
  const { to, count, total, label } = pagination;

  const isPaginationEnabled = count < total;

  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          gap-3
          w-full
        `,
        className
      )}
    >
      {/* title & see more */}
      <div
        className={`
          flex
          items-end
          justify-between
        `}
      >
        {/* title */}
        {title && (
          <h1
            className={twMerge(
              `
                flex
                items-center
                gap-1
                pl-3
                text-2xl
                font-bold
              `,
              tw?.title
            )}
          >
            {content}
            {progress && (
              <span className="text-xl text-neutral-100/30">
                ({count}/{total})
              </span>
            )}
          </h1>
        )}

        {/* see more */}
        {isPaginationEnabled && (
          <Link
            to={to}
            className={`
              text-sm
              text-neutral-100/30
              hover:text-neutral-100/50
              hover:scale-105
              transition
            `}
          >
            <span>{label}</span>
          </Link>
        )}
      </div>

      {/* collection list */}
      <div
        className={twMerge(
          `
            flex
            gap-1
            overflow-y-hidden
            overflow-x-auto
            whitespace-nowrap
            snap-x
            snap-mandatory
            hidden-scrollbar
          `,
          tw?.list
        )}
      >
        {collectionDocs.map((doc) => {
          const { _id, title, imageUrl } = doc;
          const description = Array.isArray(doc.description) ? doc.description[0] : doc.description;

          return (
            <ProfileCollectionCard
              to={`/${collectionRoute}/${_id}`}
              key={_id}
              title={title}
              imageUrl={imageUrl}
              description={description}
              tw={{
                img: `
                  w-[200px] 
                  ${
                    collectionKey === "following"
                      ? "border-2 border-neutral-500/20 rounded-full"
                      : "rounded-md"
                  }`,
                title: `${collectionKey === "following" && "text-center"}`,
                description: `${collectionKey === "following" && "text-center"}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProfileCollectionCardList;
