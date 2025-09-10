import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { AutoFitTitle } from "./info-title.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { UploadFolder } from "@joytify/types/constants";
import { RefactorProfileUserResponse } from "@joytify/types/types";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ProfileHeroSectionProps = {
  fm: ScopedFormatMessage;
  profileUser: RefactorProfileUserResponse;
  className?: string;
};

const ProfileHeroSection: React.FC<ProfileHeroSectionProps> = ({ fm, profileUser, className }) => {
  const profileHeroSectionFm = fm("profile.hero.section");

  const { username, profileImage, accountInfo } = profileUser;
  const { totalPlaylists, totalAlbums, totalFollowing, totalSongs } = accountInfo;

  const { setActiveProfileEditModal } = useUserState();
  const { mutate: updateUserInfoFn, isPending } = useUpdateUserMutation();

  const handleActiveProfileEditModal = () => {
    timeoutForDelay(() => {
      setActiveProfileEditModal({ active: true, profileUser });
    });
  };

  return (
    <div
      className={twMerge(
        `
          flex
          w-full
          px-6
          gap-x-5
        `,
        className
      )}
    >
      {/* profile image */}
      <ImageLabel
        src={profileImage}
        subfolder={UploadFolder.USERS_IMAGE}
        updateConfig={{
          updateImgFn: (profileImage) => updateUserInfoFn({ profileImage }),
          isPending,
        }}
        tw={{ mask: "rounded-full" }}
      />

      {/* content */}
      <div
        className={`
          flex
          flex-1
          flex-col
          items-start
          justify-evenly
        `}
      >
        {/* type */}
        <p className={`hero-section--type`}>{profileHeroSectionFm("type")}</p>

        {/* title */}
        <AutoFitTitle onClick={handleActiveProfileEditModal} className={`cursor-pointer`}>
          {username.split("?nanoid")[0]}
        </AutoFitTitle>

        {/* other */}
        <p className={`hero-section--description`}>
          {profileHeroSectionFm("description", {
            playlistCount: totalPlaylists - 1, // exclude default playlist
            albumCount: totalAlbums,
            followingCount: totalFollowing,
            songCount: totalSongs,
          })}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeroSection;
