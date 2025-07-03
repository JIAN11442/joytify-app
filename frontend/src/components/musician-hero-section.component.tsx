import { useCallback, useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { CiCirclePlus } from "react-icons/ci";
import Icon from "./react-icons.component";
import ImageLabel from "./image-label.component";
import { useScopedIntl } from "../hooks/intl.hook";
import {
  useFollowMusicianMutation,
  useUnfollowMusicianMutation,
} from "../hooks/musician-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type MusicianHeroSectionProps = {
  musician: RefactorMusicianResponse;
};

const MusicianHeroSection: React.FC<MusicianHeroSectionProps> = ({ musician }) => {
  const { fm } = useScopedIntl();
  const musicianRoleFm = fm("musician.role");
  const musicianHeroSectionFm = fm("musician.hero.section");

  const [isFollowing, setIsFollowing] = useState(false);

  const { authUser } = useUserState();
  const { collapseSideBarState } = useSidebarState();

  const { mutate: followMusicianFn } = useFollowMusicianMutation();
  const { mutate: unfollowMusicianFn } = useUnfollowMusicianMutation();

  const handleToggleFollowMusician = useCallback(() => {
    timeoutForDelay(() => {
      const musicianId = musician._id;

      if (isFollowing) {
        unfollowMusicianFn(musicianId);
        setIsFollowing(false);
      } else {
        followMusicianFn(musicianId);
        setIsFollowing(true);
      }
    });
  }, [isFollowing, musician, followMusicianFn, unfollowMusicianFn]);

  const { isCollapsed } = collapseSideBarState;
  const { name, roles, coverImage, songs, albums, followers } = musician;

  // check follow status
  useEffect(() => {
    if (!authUser) return;

    const followStatus = followers.includes(authUser?._id ?? "");

    setIsFollowing(followStatus);
  }, [followers, authUser]);

  return (
    <div
      className={`
        relative
        flex
        px-6
        gap-x-5
        w-full
      `}
    >
      {/* cover image */}
      <ImageLabel
        src={coverImage}
        subfolder={UploadFolder.MUSICIANS_IMAGE}
        isDefault={true}
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
        {/* roles */}
        <p>
          {roles.map((role, index) => (
            <span key={`artist-hero-section-${role}`}>
              {musicianRoleFm(role)}
              {index < roles.length - 1 && <span className="mx-2">·</span>}
            </span>
          ))}
        </p>

        {/* name */}
        <h1
          style={{ lineHeight: "1.15" }}
          className={`
            info-title
            ${isCollapsed ? "lg:text-[7rem]" : "lg:text-[6.5rem]"}
          `}
        >
          {name}
        </h1>

        {/* other - songs and albums count */}
        <p className={`text-grey-custom/50 line-clamp-1`}>
          {musicianHeroSectionFm("description", {
            songCount: songs.length,
            albumCount: albums.length,
          })}
        </p>
      </div>

      {/* following */}
      <button
        type="button"
        onClick={handleToggleFollowMusician}
        className={`
          absolute
          right-10
          bottom-2
          flex
          gap-2
          p-3
          border-[0.1px]
          border-green-500
          text-sm
          items-center
          rounded-md
          transition-all
          ${
            isFollowing
              ? "bg-green-500 hover:bg-green-500/80 font-light"
              : "text-green-500 animate-bounce"
          }
        `}
      >
        <Icon name={isFollowing ? IoMdCheckmarkCircleOutline : CiCirclePlus} opts={{ size: 20 }} />
        <p>{isFollowing ? "Following" : "Follow"}</p>
      </button>
    </div>
  );
};

export default MusicianHeroSection;
