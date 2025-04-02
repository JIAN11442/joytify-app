import { useParams } from "react-router-dom";

import ItemCard from "./item-card.component";
import ItemCardList from "./item-card-list.component";
import { ProfileCollections } from "@joytify/shared-types/constants";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { pick } from "lodash";

type ProfileBodyContentProps = {
  profileUser: RefactorProfileUserResponse;
};

const ProfileBodyContent: React.FC<ProfileBodyContentProps> = ({ profileUser }) => {
  const profileSection = pick(profileUser, ["following", "playlists", "songs", "albums"]);

  const { id } = useParams();

  const { PLAYLISTS, SONGS, ALBUMS, FOLLOWING } = ProfileCollections;

  const getProfileSection = (key: string) => {
    switch (key) {
      case "playlists":
        return PLAYLISTS;
      case "songs":
        return SONGS;
      case "albums":
        return ALBUMS;
      case "following":
        return FOLLOWING;
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
              content: key,
              progress: true,
            }}
            pagination={{
              to: `/profile/${id}/${getProfileSection(key)}`,
              count: docs.length,
              total: totalDocs,
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
                  to={`/playlist/${_id}`}
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
                      text-[15px]
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

export default ProfileBodyContent;
