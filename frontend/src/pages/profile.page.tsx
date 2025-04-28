import Loader from "../components/loader.component";
import ProfileBody from "../components/profile-body.component";
import ProfileHeader from "../components/profile-header.component";

import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

const ProfilePage = () => {
  const { profileUser } = useUserState();

  if (!profileUser) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee } = profileUser as RefactorProfileUserResponse;

  return (
    <div
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
    </div>
  );
};

export default ProfilePage;
