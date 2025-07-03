import { useScopedIntl } from "../hooks/intl.hook";
import Loader from "../components/loader.component";
import ProfileHeroSection from "../components/profile-hero-section.component";
import ProfileActionPanel from "../components/profile-action-panel.component";
import ProfileCollectionsSection from "../components/profile-collections-section.component";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useUserState from "../states/user.state";

const ProfilePage = () => {
  const { fm } = useScopedIntl();
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
        min-h-screen
        pt-10
        rounded-b-none
      `}
    >
      <ProfileHeroSection fm={fm} profileUser={profileUser} />

      <div
        className={`
          flex
          flex-col
          mt-10
          w-full
          h-full
          p-6
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900
        `}
      >
        <ProfileActionPanel fm={fm} profileUser={profileUser} />
        <ProfileCollectionsSection fm={fm} profileUser={profileUser} />
      </div>
    </div>
  );
};

export default ProfilePage;
