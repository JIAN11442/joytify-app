import ImageLabel from "./image-label.component";

import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ProfileHeaderProps = {
  profileUser: RefactorProfileUserResponse;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser }) => {
  const { username, profileImage, accountInfo } = profileUser;
  const { totalPlaylists, totalSongs } = accountInfo;

  const { setActiveProfileEditModal } = useUserState();
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { mutate: updateUserInfoFn, isPending } = useUpdateUserMutation();

  // handle active profile edit modal
  const handleActiveProfileEditModal = () => {
    timeoutForDelay(() => {
      setActiveProfileEditModal({ active: true, profileUser });
    });
  };

  return (
    <div
      className={`
        flex
        px-6
        gap-x-5
        w-full
      `}
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
          flex-col
          w-full
          lg:py-0
          items-start
          justify-between
        `}
      >
        {/* type */}
        <p>Profile</p>

        {/* title */}
        <h1
          onClick={handleActiveProfileEditModal}
          style={{ lineHeight: "1.15" }}
          className={`
            info-title
            cursor-pointer
            ${isCollapsed ? "lg:text-[7rem]" : "lg:text-[6.5rem]"}
          `}
        >
          {username.split("?nanoid")[0]}
        </h1>

        {/* other */}
        <p
          className={`
            text-grey-custom/50
            line-clamp-1
          `}
        >
          {totalPlaylists} playlists · {totalSongs} songs
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
