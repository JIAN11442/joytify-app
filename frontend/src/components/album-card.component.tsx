import { useState } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import QueuePlayButton from "./queue-play-button.component";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";

type AlbumCardProps = {
  album: RefactorAlbumResponse;
  className?: string;
};

const AlbumCard: React.FC<AlbumCardProps> = ({ album, className }) => {
  const { _id: albumId, title, coverImage, artists, songs } = album;

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/album/${albumId}`}
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
      {/* image & play button */}
      <div className={`relative`}>
        <img
          alt={title}
          src={coverImage}
          onLoad={() => setImageLoaded(true)}
          className={`
            object-cover 
            aspect-square
            brightness-[1.2]
            rounded-md
            transition-all
          `}
        />

        <QueuePlayButton songs={songs} showOnHover={true} className={`p-3`} />
      </div>

      {/* details */}
      {imageLoaded && (
        <div className={`flex flex-col w-full pl-2 gap-2 items-start`}>
          <p className={`text-neutral-300 font-medium line-clamp-1`}>{title}</p>
          <p className={`text-sm text-neutral-500 truncate capitalize`}>{artists?.join(", ")}</p>
        </div>
      )}
    </Link>
  );
};

export default AlbumCard;
