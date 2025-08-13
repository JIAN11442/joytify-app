import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { useUpdateSongInfoMutation } from "../hooks/song-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type SongHeroSectionProps = {
  song: RefactorSongResponse;
  editable: boolean;
  className?: string;
};

const SongHeroSection: React.FC<SongHeroSectionProps> = ({ song, editable, className }) => {
  const { fm } = useScopedIntl();
  const songHeroSectionFm = fm("song.hero.section");

  const { _id: songId, title, imageUrl, artist } = song;
  const { name: artistName } = artist;

  const { setActiveSongEditModal } = useSongState();
  const { mutate: updateSongInfoFn, isPending } = useUpdateSongInfoMutation(songId);

  const handleActiveEditModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongEditModal({ active: true, song });
    });
  }, [song, setActiveSongEditModal]);

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
        src={imageUrl}
        subfolder={UploadFolder.SONGS_IMAGE}
        updateConfig={{
          updateImgFn: (awsImageUrl) => updateSongInfoFn({ imageUrl: awsImageUrl }),
          isPending,
        }}
        isDefault={!editable}
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
        <p className={`hero-section--type`}>{songHeroSectionFm("type")}</p>

        {/* title */}
        <button
          type="button"
          onClick={handleActiveEditModal}
          className={`${!editable && "pointer-events-none select-none"}`}
        >
          <h1 className={`info-title`}>{title}</h1>
        </button>

        {/* other */}
        <p className={`hero-section--description`}>{artistName}</p>
      </div>
    </div>
  );
};

export default SongHeroSection;
