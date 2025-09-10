import { useState } from "react";
import { twMerge } from "tailwind-merge";
import AuthGuardLink from "./auth-guard-link.component";
import QueuePlayButton from "./queue-play-button.component";
import { RefactorSongResponse } from "@joytify/types/types";

type SongCardProps = {
  song: RefactorSongResponse;
  className?: string;
};

const SongCard: React.FC<SongCardProps> = ({ song, className }) => {
  const { _id: songId, title, imageUrl, artist } = song;
  const { name: artistName } = artist;

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <AuthGuardLink
      to={`/song/${songId}`}
      className={twMerge(
        `
          group
          grid-card-wrapper
          p-3
          gap-3
        `,
        className
      )}
    >
      <div className={`relative`}>
        <img
          alt={title}
          src={imageUrl}
          onLoad={() => setImageLoaded(true)}
          className={`
            object-cover
            aspect-square
            rounded-md
            transition-all
          `}
        />

        <QueuePlayButton songs={[song]} showOnHover={true} className={`p-3`} />
      </div>

      {/* details */}
      {imageLoaded && (
        <div className={`flex flex-col w-full pl-2 gap-2 items-start`}>
          <p className={`text-neutral-300 font-medium line-clamp-1`}>{title}</p>
          <p className={`text-sm text-neutral-500 truncate capitalize`}>{artistName}</p>
        </div>
      )}
    </AuthGuardLink>
  );
};

export default SongCard;
