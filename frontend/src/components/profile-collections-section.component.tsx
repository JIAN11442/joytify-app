import { pick } from "lodash";
import { useParams } from "react-router-dom";
import ProfileCollectionCardList from "./profile-collection-card-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { ProfileCollections } from "@joytify/types/constants";
import { RefactorProfileUserResponse } from "@joytify/types/types";

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
      default:
        return { toProfile: "", toSection: "" };
    }
  };

  return (
    <div className={`flex flex-col gap-4`}>
      {Object.entries(profileSection).map(([key, value]) => {
        const { docs, totalDocs } = value;
        const { toProfile, toSection } = getProfileSection(key);

        return (
          <ProfileCollectionCardList
            key={key}
            title={{
              content: profileCollectionsSectionFm(key),
              progress: true,
            }}
            collectionKey={key}
            collectionDocs={docs}
            collectionRoute={toProfile}
            pagination={{
              to: `/profile/${id}/${toSection}`,
              count: docs.length,
              total: totalDocs,
              label: profileCollectionsSectionFm("more"),
            }}
            className={`mt-10`}
            tw={{ title: "capitalize", list: `gap-2 p-1` }}
          />
        );
      })}
    </div>
  );
};

export default ProfileCollectionsSection;
