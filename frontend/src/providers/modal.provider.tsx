/* eslint-disable @typescript-eslint/no-explicit-any */

import { lazy, Suspense } from "react";
import useAuthModalState from "../states/auth-modal.state";
import useUploadModalState from "../states/upload-modal.state";
import usePlaylistState from "../states/playlist.state";
import useVerificationModalState from "../states/verification.state";
import useUserState from "../states/user.state";

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
};

const ModalProvider = () => {
  const { activeAuthModal } = useAuthModalState();
  const {
    activeUploadModal,
    activeCreateLabelModal,
    activeCreateAlbumModal,
    activeCreatePlaylistModal,
  } = useUploadModalState();
  const { activePlaylistEditModal, activePlaylistDeleteModal, activePlaylistPrivacyModal } =
    usePlaylistState();
  const { activeVerificationCodeModal } = useVerificationModalState();
  const { activeProfileEditModal } = useUserState();

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
    </Suspense>
  );
};

export default ModalProvider;
