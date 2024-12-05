import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";

import usePlaylistState from "../states/playlist.state";
import { MutationKey } from "../constants/query-client-key.constant";
import { changePlaylistHiddenState } from "../fetchs/playlist.fetch";
import { usePlaylistById } from "../hooks/playlist.hook";

const PlaylistRemoveModal = () => {
  const { activeRemovePlaylistModal, setActiveRemovePlaylistModal } =
    usePlaylistState();
  const { active, playlist } = activeRemovePlaylistModal;

  const { refetch: targetPlaylistRefetch } = usePlaylistById(
    playlist?._id || ""
  );

  // handle close modal
  const handleCloseModal = () => {
    setActiveRemovePlaylistModal({ active: false, playlist: null });
  };

  // handle remove playlist mutation
  const { mutate: removeUserPlaylistFromProfile } = useMutation({
    mutationKey: [MutationKey.REMOVE_PLAYLIST_FROM_PROFILE],
    mutationFn: changePlaylistHiddenState,
    onSuccess: (data) => {
      const { title } = data;

      // close modal
      handleCloseModal();

      // refetch target playlist
      targetPlaylistRefetch();

      // display success message
      toast.success(`"${title}" playlist removed from profile`);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // handle remove playlist
  const handleRemovePlaylist = () => {
    removeUserPlaylistFromProfile({
      playlistId: playlist?._id || "",
      hiddenState: true,
    });
  };

  return (
    <Modal activeState={active} closeModalFn={handleCloseModal}>
      <PlaylistWarningContent
        playlist={playlist}
        executeBtnText="Remove"
        closeModalFn={handleCloseModal}
        executeFn={handleRemovePlaylist}
      >
        {/* Warning text */}
        <p className={`text-red-500/80`}>
          This will delete the playlist{" "}
          <span className={`font-bold text-white`}>{playlist?.title}</span> from
          your profile, but it will not delete the playlist and you could add it
          again.
        </p>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistRemoveModal;
