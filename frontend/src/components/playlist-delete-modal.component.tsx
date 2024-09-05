import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";

import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";

import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { deletePlaylist } from "../fetchs/playlist.fetch";
import queryClient from "../config/query-client.config";

const PlaylistDeleteModal = () => {
  const navigate = useNavigate();

  const { activeDeletePlaylistModal, setActiveDeletePlaylistModal } =
    usePlaylistState();
  const { active, playlist } = activeDeletePlaylistModal;

  // delete playlist mutation
  const { mutate: deleteUserPlaylist } = useMutation({
    mutationKey: [MutationKey.DELETE_PLAYLIST],
    mutationFn: deletePlaylist,
    onSuccess: () => {
      handleCloseModal();

      queryClient.invalidateQueries([
        QueryKey.GET_USER_PLAYLISTS,
      ] as InvalidateQueryFilters);

      toast.success(`Playlist "${playlist?.title}" has been deleted.`);

      navigate("/");
    },
    onError: () => {
      toast.error(`Failed to delete playlist "${playlist?.title}".`);
    },
  });

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveDeletePlaylistModal({ active: false, playlist: null });
    });
  };

  const handleDeleteUserPlaylist = () => {
    deleteUserPlaylist(playlist?._id || "");
  };

  return (
    <Modal activeState={active} closeModalFn={handleCloseModal}>
      <PlaylistWarningContent
        playlist={playlist}
        executeBtnText="Delete"
        closeModalFn={handleCloseModal}
        executeFn={handleDeleteUserPlaylist}
      >
        {/* Warning text */}
        <p className={`text-red-500/80`}>
          This will delete playlist{" "}
          <span
            className={`
              font-bold
             text-white
             `}
          >
            {playlist?.title}
          </span>{" "}
          from your library, and you won't be able to restore it.
        </p>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistDeleteModal;
