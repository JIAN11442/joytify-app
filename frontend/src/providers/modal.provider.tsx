import { lazy, Suspense } from "react";
import useAuthModalState from "../states/auth-modal.state";
import useUploadModalState from "../states/upload-modal.state";
import usePlaylistState from "../states/playlist.state";
import useVerificationModalState from "../states/verification.state";

const path = "../components";

const modalComponents = {
  auth: lazy(() => import(`${path}/auth-modal.component`)),
  upload: lazy(() => import(`${path}/upload-modal.component`)),
  createLabel: lazy(() => import(`${path}/create-label-modal.component`)),
  createAlbum: lazy(() => import(`${path}/create-album-modal.component`)),
  createPlaylist: lazy(() => import(`${path}/create-playlist-modal.component`)),
  editPlaylist: lazy(() => import(`${path}/playlist-edit-modal.component`)),
  deletePlaylist: lazy(() => import(`${path}/playlist-delete-modal.component`)),
  removePlaylist: lazy(() => import(`${path}/playlist-remove-modal.component`)),
  verification: lazy(() => import(`${path}/verification-code-modal.component`)),
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
    activeDeletePlaylistModal,
    activeRemovePlaylistModal,
  } = usePlaylistState();
  const { activeVerificationCodeModal } = useVerificationModalState();

  return (
    <Suspense fallback={null}>
      {activeAuthModal && <modalComponents.auth />}
      {activeUploadModal && <modalComponents.upload />}
      {activeCreateLabelModal.active && <modalComponents.createLabel />}
      {activeCreateAlbumModal.active && <modalComponents.createAlbum />}
      {activeCreatePlaylistModal.active && <modalComponents.createPlaylist />}
      {activePlaylistEditModal.active && <modalComponents.editPlaylist />}
      {activeDeletePlaylistModal.active && <modalComponents.deletePlaylist />}
      {activeRemovePlaylistModal.active && <modalComponents.removePlaylist />}
      {activeVerificationCodeModal.active && <modalComponents.verification />}
    </Suspense>
  );
};

export default ModalProvider;
