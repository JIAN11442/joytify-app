import { pick } from "lodash";
import { useParams } from "react-router-dom";
import ItemCard from "./item-card.component";
import ItemCardList from "./item-card-list.component";
import { ProfileCollections } from "@joytify/shared-types/constants";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type ProfileCollectionsSectionProps = {
  fm: ScopedFormatMessage;
  profileUser: RefactorProfileUserResponse;
};

const ProfileCollectionsSection: React.FC<ProfileCollectionsSectionProps> = ({
  fm,
  profileUser,
}) => {
  const profileCollectionsSectionFm = fm("profile.collections.section");
  const profileSection = pick(profileUser, ["following", "playlists", "songs", "albums"]);

  const { id } = useParams();

  const { PLAYLISTS, SONGS, ALBUMS, FOLLOWING } = ProfileCollections;

  const getProfileSection = (key: string) => {
    switch (key) {
      case "playlists":
        return { toProfile: "playlist", toSection: PLAYLISTS };
      case "songs":
        return { toProfile: "song", toSection: SONGS };
      case "albums":
        return { toProfile: "album", toSection: ALBUMS };
      case "following":
        return { toProfile: "musician", toSection: FOLLOWING };
    }
  };

  return (
    <div
      className={`
        flex
        flex-col
        gap-4
      `}
    >
      {Object.entries(profileSection).map(([key, value]) => {
        const { docs, totalDocs } = value;
        return (
          <ItemCardList
            key={key}
            title={{
              content: profileCollectionsSectionFm(key),
              progress: true,
            }}
            pagination={{
              to: `/profile/${id}/${getProfileSection(key)?.toSection}`,
              count: docs.length,
              total: totalDocs,
              label: profileCollectionsSectionFm("more"),
            }}
            className={`mt-10`}
            tw={{ title: "capitalize", list: `gap-2 p-1` }}
          >
            {docs.map((doc) => {
              const { _id, title, imageUrl } = doc;
              const description = Array.isArray(doc.description)
                ? doc.description[0]
                : doc.description;

              return (
                <ItemCard
                  to={`/${getProfileSection(key)?.toProfile}/${_id}`}
                  key={_id}
                  title={title}
                  imageUrl={imageUrl}
                  description={description}
                  className={`
                    w-[200px]
                    hover:bg-neutral-500/10
                    transition
                  `}
                  tw={{
                    img: `
                      ${key === "following" ? "rounded-full" : "rounded-md"} 
                      aspect-square
                      object-cover
                      w-[200px]
                    `,
                    title: `
                      font-medium 
                      text-[14px]
                      text-neutral-400
                      ${key === "following" && "text-center"}
                    `,
                    description: `${key === "following" && "text-center"}`,
                  }}
                />
              );
            })}
          </ItemCardList>
        );
      })}
    </div>
  );
};

export default ProfileCollectionsSection;
