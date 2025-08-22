import { useState } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import QueuePlayButton from "./queue-play-button.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";

type MusicianCardProps = {
  musician: RefactorMusicianResponse;
  className?: string;
  tw?: { img?: string };
};

const MusicianCard: React.FC<MusicianCardProps> = ({ musician, className, tw }) => {
  const { _id: musicianId, name, coverImage, paletee, songs, roles } = musician;

  const { fm } = useScopedIntl();
  const [imageLoaded, setImageLoaded] = useState(false);

  const musicianRoleFm = fm("musician.role");

  return (
    <Link
      to={`/musician/${musicianId}`}
      className={twMerge(
        `
          group
          grid-card-wrapper
          hover:bg-neutral-200/5
          p-3
          gap-3
          w-fit
        `,
        className
      )}
    >
      {/* image & play button */}
      <div className={`relative`}>
        <img
          alt={name}
          src={coverImage}
          style={
            {
              "--image-border-color": paletee?.vibrant,
            } as React.CSSProperties
          }
          onLoad={() => setImageLoaded(true)}
          className={twMerge(
            `
              aspect-square
              object-cover
              brightness-[1.2]
              shadow-[0_0_2px_rgba(0,0,0,0.5)]
              shadow-[var(--image-border-color)]
              rounded-full
              transition-all
            `,
            tw?.img
          )}
        />

        <QueuePlayButton songs={songs} showOnHover={true} className={`p-3`} />
      </div>

      {/* details */}
      {imageLoaded && (
        <div className={`flex flex-col w-full pl-5 gap-2 items-start`}>
          <p className={`text-neutral-300 font-medium line-clamp-1`}>{name}</p>
          <p className={`text-sm text-neutral-500 truncate capitalize`}>
            {musicianRoleFm(roles[0])}
          </p>
        </div>
      )}
    </Link>
  );
};

export default MusicianCard;
