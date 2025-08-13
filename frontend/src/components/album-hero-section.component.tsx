import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type AlbumHeroSectionProps = {
  fm: ScopedFormatMessage;
  album: RefactorAlbumResponse;
  className?: string;
};

const AlbumHeroSection: React.FC<AlbumHeroSectionProps> = ({ fm, album, className }) => {
  const { ALBUMS_IMAGE } = UploadFolder;
  const { title, coverImage, songs } = album;

  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);

  const albumHeroSectionFm = fm("album.hero.section");

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
      {/* cover image */}
      <ImageLabel src={coverImage} subfolder={ALBUMS_IMAGE} isDefault={true} />

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
        {/* album */}
        <p className={`hero-section--type`}>{albumHeroSectionFm("type")}</p>

        {/* title */}
        <h1 className={`info-title`}>{title}</h1>

        {/* other - songs count */}
        <p className={`hero-section--description`}>
          {albumHeroSectionFm("description", {
            count: songs.length,
            duration: formatPlaybackDuration({
              fm,
              duration: totalDuration,
              precise: true,
              format: "text",
            }),
          })}
        </p>
      </div>
    </div>
  );
};

export default AlbumHeroSection;
