import { useCallback } from "react";
import ImageLabel from "./image-label.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { useUpdateSongInfoMutation } from "../hooks/song-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type SongHeroSectionProps = {
  song: RefactorSongResponse;
  editable: boolean;
};

const SongHeroSection: React.FC<SongHeroSectionProps> = ({ song, editable }) => {
  const { fm } = useScopedIntl();
  const songHeroSectionFm = fm("song.hero.section");

  const { collapseSideBarState } = useSidebarState();
  const { setActiveSongEditModal } = useSongState();
  const { mutate: updateSongInfoFn, isPending } = useUpdateSongInfoMutation(song._id);

  const { isCollapsed } = collapseSideBarState;
  const { title, imageUrl, artist } = song;

  const handleActiveEditModal = useCallback(() => {
    timeoutForDelay(() => {
      setActiveSongEditModal({ active: true, song });
    });
  }, [song, setActiveSongEditModal]);

  return (
    <div
      className={`
        relative
        flex
        px-6
        gap-x-5
        w-full
      `}
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
          flex-col
          w-full
          lg:py-0
          items-start
          justify-between
        `}
      >
        {/* type */}
        <p>{songHeroSectionFm("type")}</p>

        {/* title */}
        <button
          type="button"
          onClick={handleActiveEditModal}
          className={`${!editable && "pointer-events-none select-none"}`}
        >
          <h1
            style={{ lineHeight: "1.15" }}
            className={`
              info-title
              ${isCollapsed ? "lg:text-[7rem]" : "lg:text-[6.5rem]"}
            `}
          >
            {title}
          </h1>
        </button>

        {/* other */}
        <p className={`text-grey-custom/50 line-clamp-1`}>{artist}</p>
      </div>
    </div>
  );
};

export default SongHeroSection;
