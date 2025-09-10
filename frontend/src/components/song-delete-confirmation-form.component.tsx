import { ScopedFormatMessage } from "../hooks/intl.hook";
import SongTitleItem from "./song-title-item.component";
import WarningMsgBox from "./warning-message-box.component";
import { RefactorSongResponse } from "@joytify/types/types";

type SongDeleteConfirmationFormProps = {
  song: RefactorSongResponse;
  fm: ScopedFormatMessage;
  closeModalFn: () => void;
  switchToNextPageFn: () => void;
};

const SongDeleteConfirmationForm = ({
  song,
  fm,
  closeModalFn,
  switchToNextPageFn,
}: SongDeleteConfirmationFormProps) => {
  const { title, imageUrl, artist, paletee } = song;
  const { name: artistName } = artist;

  const modalConfirmationFm = fm("song.delete.modal.confirmation");

  return (
    <form className={`flex flex-col gap-5`}>
      {/* preview */}
      <SongTitleItem
        title={title}
        imageUrl={imageUrl}
        artist={artistName}
        style={{
          backgroundImage: `linear-gradient(
            to top,
            ${paletee?.muted} 50%,
            ${paletee?.vibrant} 100%
          )`,
        }}
        className={{
          item: "flex p-3 w-full rounded-md",
          image: "w-20 h-20",
          title: "text-neutral-200",
          artist: "text-neutral-300",
        }}
      />

      {/* warning */}
      <WarningMsgBox
        warningMsg={modalConfirmationFm("warning")}
        tw={{
          wrapper: "my-0",
          msg: "text-[14px] leading-6",
          clsIcon: "hidden",
        }}
      />

      {/* delete confirmation form */}
      <p className={`text-red-500 font-bold`}>{modalConfirmationFm("content")}</p>

      {/* buttons */}
      <div
        className={`
          flex
          flex-col
          w-full
          gap-3
        `}
      >
        {/* next */}
        <button type="button" onClick={switchToNextPageFn} className={`submit-btn bg-red-500`}>
          {modalConfirmationFm("next")}
        </button>

        {/* cancel */}
        <button type="button" onClick={closeModalFn} className={`submit-btn bg-neutral-500/50`}>
          {modalConfirmationFm("cancel")}
        </button>
      </div>
    </form>
  );
};

export default SongDeleteConfirmationForm;
