import { twMerge } from "tailwind-merge";
import { BsCheckAll } from "react-icons/bs";
import Icon from "./react-icons.component";
import ImageLabel from "./image-label.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorMusicianResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type MusicianHeroSectionProps = {
  fm: ScopedFormatMessage;
  followed: boolean;
  musician: RefactorMusicianResponse;
  className?: string;
};

const MusicianHeroSection: React.FC<MusicianHeroSectionProps> = ({
  fm,
  followed,
  musician,
  className,
}) => {
  const musicianRoleFm = fm("musician.role");
  const musicianHeroSectionFm = fm("musician.hero.section");

  const { name, roles, coverImage, songs, albums } = musician;

  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);

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
          flex-1
          flex-col
          items-start
          justify-evenly
        `}
      >
        {/* type */}
        <div className={`flex gap-2 items-center`}>
          {followed && <Icon name={BsCheckAll} opts={{ size: 30 }} className={`text-green-400`} />}

          <p className={`hero-section--type`}>
            {roles.map((role, index) => (
              <span key={`artist-hero-section-${role}`}>
                {musicianRoleFm(role)}
                {index < roles.length - 1 && <span className="mx-2">·</span>}
              </span>
            ))}
          </p>
        </div>

        {/* name */}
        <h1 className={`info-title`}>{name}</h1>

        {/* description */}
        <p className={`hero-section--description`}>
          {musicianHeroSectionFm("description", {
            songCount: songs.length,
            albumCount: albums.length,
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

export default MusicianHeroSection;
