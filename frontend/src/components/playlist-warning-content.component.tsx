import { refactorResPlaylist } from "../constants/axios-response.constant";

type PlaylistWarningContentProps = {
  playlist: refactorResPlaylist | null;
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
  const { title, cover_image, description, songs, paletee } = playlist ?? {};

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
            ${paletee?.darkVibrant} 0%,
            ${paletee?.darkMuted} 20%,
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
          src={cover_image}
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
          {/* Playlist type */}
          <p>
            <span>Playlist</span>
            {description && (
              <>
                <span> · </span>
                <span>{songs?.length} songs</span>
              </>
            )}
          </p>

          {/* Title */}
          <p
            className={`
              text-2xl
              font-bold
              font-serif
            `}
          >
            {title}
          </p>

          {/* Description or Others */}
          <p>{description ? description : `${songs?.length} songs`}</p>
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
          Cancel
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
