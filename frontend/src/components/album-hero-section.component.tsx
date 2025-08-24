import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { AutoFitTitle } from "./info-title.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { useUpdateAlbumMutation } from "../hooks/album-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorAlbumResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";
import useUserState from "../states/user.state";

type AlbumHeroSectionProps = {
  fm: ScopedFormatMessage;
  album: RefactorAlbumResponse;
  className?: string;
};

const AlbumHeroSection: React.FC<AlbumHeroSectionProps> = ({ fm, album, className }) => {
  const { ALBUMS_IMAGE } = UploadFolder;
  const { _id: albumId, creator, title, coverImage, songs } = album;

  const { authUser } = useUserState();
  const { _id: userId } = authUser ?? {};

  const { mutate: updateAlbumFn, isPending } = useUpdateAlbumMutation();

  const isCreator = creator.toString() === userId;
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
      <ImageLabel
        src={coverImage}
        subfolder={ALBUMS_IMAGE}
        isDefault={!isCreator}
        updateConfig={{
          updateImgFn: (coverImage) => updateAlbumFn({ albumId, coverImage }),
          isPending,
        }}
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
        {/* album */}
        <p className={`hero-section--type`}>{albumHeroSectionFm("type")}</p>

        {/* title */}
        <AutoFitTitle>{title}</AutoFitTitle>

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
