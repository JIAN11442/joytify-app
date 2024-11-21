import AuthModal from "../components/auth-modal.component";
import CreateAlbumModal from "../components/create-album-modal.component";
import CreateLabelModal from "../components/create-label-modal.component";
import CreatePlaylistModal from "../components/create-playlist-modal.component";
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
      <CreateLabelModal />
      <CreatePlaylistModal />
      <CreateAlbumModal />
    </>
  );
};

export default ModalProvider;
