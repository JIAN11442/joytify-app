import { twMerge } from "tailwind-merge";
import ImageLabel from "./image-label.component";
import { AutoFitTitle } from "./info-title.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { formatPlaybackDuration } from "../utils/unit-format.util";

type PlaylistHeroSectionProps = {
  fm: ScopedFormatMessage;
  playlist: RefactorPlaylistResponse;
  className?: string;
};

const PlaylistHeroSection: React.FC<PlaylistHeroSectionProps> = ({ fm, playlist, className }) => {
  const { _id: playlistId, title, songs, description, coverImage, default: isDefault } = playlist;

  const { setActivePlaylistEditModal } = usePlaylistState();
  const { mutate: updatePlaylistFn, isPending } = useUpdatePlaylistMutation(playlistId);

  const handleActivePlaylistEditModal = () => {
    if (isDefault) return;

    timeoutForDelay(() => {
      setActivePlaylistEditModal({ active: true, playlist });
    });
  };

  const playlistItemFm = fm("playlist.item");
  const playlistHeroSectionFm = fm("playlist.hero.section");

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
        subfolder={UploadFolder.PLAYLISTS_IMAGE}
        updateConfig={{
          updateImgFn: (awsImageUrl) => updatePlaylistFn({ coverImage: awsImageUrl }),
          isPending,
        }}
        isDefault={isDefault}
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
        <p className={`hero-section--type`}>
          {playlistHeroSectionFm("type", {
            type: playlistItemFm("type"),
            songCount: playlistItemFm("songs.count", { count: songs.length }),
            duration: formatPlaybackDuration({
              fm,
              duration: totalDuration,
              precise: true,
              format: "text",
            }),
          })}
        </p>

        {/* title */}
        <button
          type="button"
          onClick={handleActivePlaylistEditModal}
          className={`${isDefault && "cursor-default"}`}
        >
          <AutoFitTitle>{title}</AutoFitTitle>
        </button>

        {/* other - description or songs count */}
        <p className={`hero-section--description`}>
          {description ? description : playlistItemFm("songs.count", { count: songs.length })}
        </p>
      </div>
    </div>
  );
};

export default PlaylistHeroSection;
