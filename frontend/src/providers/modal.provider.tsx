import AuthModal from "../components/auth-modal.component";
import PlaylistDeleteModal from "../components/playlist-delete-modal.component";
import PlaylistEditModal from "../components/playlist-edit-modal.component";
import PlaylistRemoveModal from "../components/playlist-remove-modal.component";
import UploadModal from "../components/upload-modal.component";

const ModalProvider = () => {
  return (
    <>
      <AuthModal />
      <UploadModal />
      <PlaylistEditModal />
      <PlaylistDeleteModal />
      <PlaylistRemoveModal />
    </>
  );
};

export default ModalProvider;
