import { twMerge } from "tailwind-merge";
import ArrangementOptions from "../constants/arrangement.constant";
import usePlaylistState from "../states/playlist.state";

type SongTitleItemProps = {
  title: string;
  imageUrl: string;
  artist: string;
  switchFunc?: boolean;
  onClick?: () => void;
  className?: { wrapper?: string; image?: string };
};

const SongTitleItem: React.FC<SongTitleItemProps> = ({
  title,
  imageUrl,
  artist,
  switchFunc = true,
  onClick,
  className,
}) => {
  const { songArrangementType } = usePlaylistState();
  const compact = ArrangementOptions.COMPACT;

  return (
    <div
      onClick={onClick}
      className={twMerge(
        `
          flex
          flex-shrink-0
          gap-3
          items-center
        `,
        className?.wrapper
      )}
    >
      <img
        src={imageUrl}
        className={twMerge(`
          w-[3.3rem]
          h-[3.3rem]
          object-cover
          rounded-md
          ${
            switchFunc && songArrangementType === compact ? "hidden" : "block"
          }  
        `)}
      />

      <div>
        <p className={`text-white line-clamp-1`}>{title}</p>
        <p
          className={`
            text-[12px]
            ${
              switchFunc && songArrangementType === compact ? "hidden" : "block"
            }
          `}
        >
          {artist}
        </p>
      </div>
    </div>
  );
};

export default SongTitleItem;
