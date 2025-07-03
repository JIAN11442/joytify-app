import { useCallback, useState } from "react";
import { RiUserUnfollowFill } from "react-icons/ri";
import Icon from "./react-icons.component";
import ManageArtistCardImage from "./manage-musician-card-image.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { MusicianResponse } from "@joytify/shared-types/types";
import useManagesState from "../states/manages.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ManageMusicianCardProps = {
  fm: ScopedFormatMessage;
  musician: MusicianResponse;
  tw?: { img?: string };
};

const ManageMusicianCard: React.FC<ManageMusicianCardProps> = ({ fm, musician, tw }) => {
  const [isGroupHovered, setIsGroupHovered] = useState(false);
  const { setActiveMusicianUnFollowModal } = useManagesState();

  const handleActiveMusicianUnfollowModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveMusicianUnFollowModal({ active: true, musician });
    });
  }, [musician, setActiveMusicianUnFollowModal]);

  const { name } = musician;

  return (
    <div
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
      onTouchStart={() => setIsGroupHovered(true)}
      onTouchEnd={() => setIsGroupHovered(false)}
      className={`
        card-wrapper
        items-center
      `}
    >
      {/* image */}
      <ManageArtistCardImage fm={fm} musician={musician} tw={tw} />

      {/* content */}
      <div
        className={`
          grid
          grid-cols-2
          w-full
          items-center
          text-neutral-300
        `}
      >
        <p>
          <span className={`font-semibold whitespace-nowrap`}>{name}</span>
        </p>

        <button
          type="button"
          onClick={handleActiveMusicianUnfollowModal}
          style={{ color: isGroupHovered ? "red" : undefined }}
          className={`
            flex
            w-full
            text-neutral-500/50
            opacity-50
            hover:opacity-100
            items-center
            justify-end
          `}
        >
          <Icon name={RiUserUnfollowFill} opts={{ size: 18 }} />
        </button>
      </div>
    </div>
  );
};

export default ManageMusicianCard;
