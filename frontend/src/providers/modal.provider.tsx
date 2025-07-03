/* eslint-disable @typescript-eslint/no-explicit-any */

import { lazy, Suspense } from "react";
import useUserState from "../states/user.state";
import usePlaylistState from "../states/playlist.state";
import useSettingsState from "../states/settings.state";
import useAuthModalState from "../states/auth-modal.state";
import useUploadModalState from "../states/upload-modal.state";
import useVerificationModalState from "../states/verification.state";
import useManagesState from "../states/manages.state";
import useSongState from "../states/song.state";

// import all components
const components = import.meta.glob("../components/*.component.tsx");

// get the path of the component
const path = (filename: string) => {
  const key = `../components/${filename}.component.tsx`;
  if (!(key in components)) {
    throw new Error(`Module "${filename}" not found`);
  }

  return components[key]() as Promise<{ default: React.ComponentType<any> }>;
};

const Modal = {
  authModal: lazy(() => path("auth-modal")),
  uploadModal: lazy(() => path("upload-modal")),
  labelCreateModal: lazy(() => path("create-label-modal")),
  albumCreateModal: lazy(() => path("create-album-modal")),
  playlistCreateModal: lazy(() => path("create-playlist-modal")),
  playlistEditModal: lazy(() => path("playlist-edit-modal")),
  playlistDeleteModal: lazy(() => path("playlist-delete-modal")),
  playlistPrivacyModal: lazy(() => path("playlist-privacy-modal")),
  verificationCodeModal: lazy(() => path("verification-code-modal")),
  profileEditModal: lazy(() => path("profile-edit-modal")),
  changePasswordModal: lazy(() => path("change-password-modal")),
  accountDeregistrationModal: lazy(() => path("account-deregistration-modal")),
  songEditModal: lazy(() => path("song-edit-modal")),
  songDetailCardModal: lazy(() => path("song-detail-card-modal")),
  songRateModal: lazy(() => path("song-rate-modal")),
  songDeleteModal: lazy(() => path("song-delete-modal")),
  songAssignmentModal: lazy(() => path("song-playlist-assignment-modal")),
  playlistAdvancedEditModal: lazy(() => path("playlist-advanced-edit-modal")),
  playlistAdvancedCreateModal: lazy(() => path("playlist-advanced-create-modal")),
  musicianUnfollowModal: lazy(() => path("musician-unfollow-modal")),
};

const ModalProvider = () => {
  const { activeAuthModal } = useAuthModalState();
  const {
    activeUploadModal,
    activeCreateLabelModal,
    activeCreateAlbumModal,
    activeCreatePlaylistModal,
  } = useUploadModalState();
  const {
    activePlaylistEditModal,
    activePlaylistAdvancedEditModal,
    activePlaylistAdvancedCreateModal,
    activePlaylistDeleteModal,
    activePlaylistPrivacyModal,
  } = usePlaylistState();
  const { activeProfileEditModal } = useUserState();
  const { activeVerificationCodeModal } = useVerificationModalState();
  const { activeChangePasswordModal, activeAccountDeregistrationModal } = useSettingsState();
  const {
    activeSongEditModal,
    activeSongRateModal,
    activeSongDetailCardModal,
    activeSongAssignmentModal,
  } = useSongState();
  const { activeSongDeleteModal, activeMusicianUnFollowModal } = useManagesState();

  return (
    <Suspense fallback={null}>
      {activeAuthModal && <Modal.authModal />}
      {activeUploadModal && <Modal.uploadModal />}
      {activeCreateLabelModal.active && <Modal.labelCreateModal />}
      {activeCreateAlbumModal.active && <Modal.albumCreateModal />}
      {activeCreatePlaylistModal.active && <Modal.playlistCreateModal />}
      {activePlaylistEditModal.active && <Modal.playlistEditModal />}
      {activePlaylistDeleteModal.active && <Modal.playlistDeleteModal />}
      {activePlaylistPrivacyModal.active && <Modal.playlistPrivacyModal />}
      {activeVerificationCodeModal.active && <Modal.verificationCodeModal />}
      {activeProfileEditModal.active && <Modal.profileEditModal />}
      {activeChangePasswordModal && <Modal.changePasswordModal />}
      {activeAccountDeregistrationModal.active && <Modal.accountDeregistrationModal />}
      {activeSongEditModal.active && <Modal.songEditModal />}
      {activeSongDetailCardModal.active && <Modal.songDetailCardModal />}
      {activeSongRateModal.active && <Modal.songRateModal />}
      {activeSongDeleteModal.active && <Modal.songDeleteModal />}
      {activeSongAssignmentModal.active && <Modal.songAssignmentModal />}
      {activePlaylistAdvancedEditModal.active && <Modal.playlistAdvancedEditModal />}
      {activePlaylistAdvancedCreateModal && <Modal.playlistAdvancedCreateModal />}
      {activeMusicianUnFollowModal.active && <Modal.musicianUnfollowModal />}
    </Suspense>
  );
};

export default ModalProvider;
