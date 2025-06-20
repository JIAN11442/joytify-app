import Modal from "./modal.component";
import SongDeleteDonationForm from "./song-delete-donation-form.component";
import SongDeleteConfirmationForm from "./song-delete-confirmation-form.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { SongDeleteStatus } from "@joytify/shared-types/constants";
import { timeoutForDelay } from "../lib/timeout.lib";
import useManagesState from "../states/manages.state";

const SongDeleteModal = () => {
  const { fm } = useScopedIntl();
  const songDeleteModalFm = fm("song.delete.modal");

  const { activeSongDeleteModal, setActiveSongDeleteModal } = useManagesState();
  const { active, song, status } = activeSongDeleteModal;

  const { INITIAL_CONFIRMATION, DATA_DONATION } = SongDeleteStatus;

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveSongDeleteModal({ ...activeSongDeleteModal, active: false, song: null });
    });
  };

  const handleSwitchToNextPage = () => {
    timeoutForDelay(() => {
      setActiveSongDeleteModal({
        ...activeSongDeleteModal,
        status: DATA_DONATION,
      });
    });
  };

  const handleBackToInitialPage = () => {
    timeoutForDelay(() => {
      setActiveSongDeleteModal({
        ...activeSongDeleteModal,
        status: INITIAL_CONFIRMATION,
      });
    });
  };

  if (!song) return;

  const modalTitle =
    status === INITIAL_CONFIRMATION
      ? songDeleteModalFm("confirmation.title")
      : songDeleteModalFm("donation.title");

  const modalDescription =
    status === INITIAL_CONFIRMATION ? undefined : songDeleteModalFm("donation.description");

  return (
    <Modal
      title={modalTitle}
      description={modalDescription}
      activeState={active}
      closeModalFn={handleCloseModal}
      switchPage={{ initialPage: INITIAL_CONFIRMATION, currentPage: status }}
      className={`sm:min-w-[550px]`}
      tw={status === DATA_DONATION ? { title: "text-start", description: "text-start" } : {}}
    >
      {/* confirmation form */}
      {status === INITIAL_CONFIRMATION && (
        <SongDeleteConfirmationForm
          fm={fm}
          song={song}
          closeModalFn={handleCloseModal}
          switchToNextPageFn={handleSwitchToNextPage}
        />
      )}

      {/* data donation form */}
      {status === DATA_DONATION && (
        <SongDeleteDonationForm
          fm={fm}
          song={song}
          closeModalFn={handleCloseModal}
          backToInitialPageFn={handleBackToInitialPage}
        />
      )}
    </Modal>
  );
};

export default SongDeleteModal;
