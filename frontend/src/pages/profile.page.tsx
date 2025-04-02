import Loader from "../components/loader.component";
import ContentBox from "../components/content-box.component";
import ProfileBody from "../components/profile-body.component";
import ProfileHeader from "../components/profile-header.component";

import { useGetProfileUserInfoQuery } from "../hooks/user-query.hook";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";

const ProfilePage = () => {
  const { profileUser } = useGetProfileUserInfoQuery();

  if (!profileUser) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee } = profileUser as RefactorProfileUserResponse;

  return (
    <ContentBox
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.lightMuted} 0%,
          ${paletee?.muted} 15%,
          ${paletee?.darkMuted} 40%,
          #171717 70%
        )`,
      }}
      className={`
        h-full
        pt-10
        rounded-b-none
      `}
    >
      <ProfileHeader profileUser={profileUser} />
      <ProfileBody profileUser={profileUser} />
    </ContentBox>
  );
};

export default ProfilePage;
