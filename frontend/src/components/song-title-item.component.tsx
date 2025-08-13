import { twMerge } from "tailwind-merge";
import { ArrangementOptions } from "../constants/arrangement.constant";
import useSongState from "../states/song.state";

type SongTitleItemProps = {
  title: string;
  imageUrl: string;
  artist: string;
  switchFunc?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: {
    item?: string;
    image?: string;
    content?: string;
    title?: string;
    artist?: string;
  };
  children?: React.ReactNode;
};

const SongTitleItem: React.FC<SongTitleItemProps> = ({
  title,
  imageUrl,
  artist,
  switchFunc = true,
  onClick,
  style,
  className,
  children,
}) => {
  const { songListArrangementType } = useSongState();
  const compact = ArrangementOptions.COMPACT;

  return (
    <div
      onClick={onClick}
      style={style}
      className={twMerge(
        `
          flex
          gap-3
          items-center
        `,
        className?.item
      )}
    >
      <img
        src={imageUrl}
        className={twMerge(
          `
            w-[3.3rem]
            h-[3.3rem]
            object-cover
            rounded-md
            ${switchFunc && songListArrangementType === compact ? "hidden" : "block"}  
          `,
          className?.image
        )}
      />

      <div className={twMerge(`flex flex-col gap-1 min-w-[100px]`, className?.content)}>
        <p className={twMerge(`text-white truncate`, className?.title)}>{title}</p>
        <p
          className={twMerge(
            ` text-[12px]
              ${switchFunc && songListArrangementType === compact ? "hidden" : "block"}
            `,
            className?.artist
          )}
        >
          {artist}
        </p>
      </div>

      {children}
    </div>
  );
};

export default SongTitleItem;
