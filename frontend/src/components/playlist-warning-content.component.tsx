import { useScopedIntl } from "../hooks/intl.hook";
import Loader from "./loader.component";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";

type PlaylistWarningContentProps = {
  playlist: RefactorPlaylistResponse | null;
  executeBtnText: string;
  closeModalFn: () => void;
  executeFn?: () => void;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isValid?: boolean;
  isPending?: boolean;
  children?: React.ReactNode;
};

const PlaylistWarningContent: React.FC<PlaylistWarningContentProps> = ({
  playlist,
  executeBtnText,
  closeModalFn,
  executeFn,
  onSubmit,
  isValid = true,
  isPending = false,
  children,
}) => {
  const { fm } = useScopedIntl();
  const playlistBannerSectionFm = fm("playlist.banner.section");
  const playlistItemFm = fm("playlist.item");
  const playlistWarningContentFm = fm("playlist.warning.content");

  // if playlist is not loaded, show loader
  if (!playlist) {
    return <Loader />;
  }

  const { title, coverImage, description, songs, paletee } = playlist;

  return (
    <form
      onSubmit={onSubmit}
      className={`
        flex
        flex-col
        p-2
        gap-5
      `}
    >
      {/* Preview */}
      <div
        style={{
          backgroundImage: `linear-gradient(
            to top right,
            #262626 0%,
            ${paletee?.darkVibrant} 20%,
            ${paletee?.vibrant} 50%,
            #262626 100%
          )`,
        }}
        className={`
          flex
          p-3
          gap-x-5
          rounded-md
        `}
      >
        {/* cover image */}
        <img
          src={coverImage}
          className={`
            w-[8rem]
            h-[8rem]
            rounded-md
            object-cover
            overflow-hidden
          `}
        />

        <div
          className={`
            flex
            flex-col
            p-3
            items-start
            justify-between
            text-grey-custom/50
          `}
        >
          {/* playlist type */}
          <p className={`text-sm`}>
            {playlistBannerSectionFm("type", {
              type: playlistItemFm("type"),
              separator: description ? " · " : "",
              description: description
                ? playlistItemFm("songs.count", { count: songs.length })
                : "",
            })}
          </p>

          {/* title */}
          <p className={`text-2xl font-bold font-serif`}>{title}</p>

          {/* description or others */}
          <p className={`text-[14px] text-grey-custom/50 line-clamp-1`}>
            {description ? description : playlistItemFm("songs.count", { count: songs.length })}
          </p>
        </div>
      </div>

      {/* Warning text */}
      {children}

      {/* Buttons */}
      <div
        className={`
          flex
          gap-x-10
          items-center
          justify-center
        `}
      >
        {/* cancel */}
        <button
          type="button"
          onClick={closeModalFn}
          className={`
            submit-btn
            w-fit
            px-10
            text-sm
            rounded-md
            bg-neutral-600
            border-none
          `}
        >
          {playlistWarningContentFm("reject.button.cancel")}
        </button>

        {/* execute */}
        <button
          type={executeFn ? "button" : "submit"}
          onClick={executeFn}
          disabled={!isValid || isPending}
          className={`
            submit-btn
            w-fit
            px-10
            text-sm
            rounded-md
          `}
        >
          {executeBtnText}
        </button>
      </div>
    </form>
  );
};

export default PlaylistWarningContent;
