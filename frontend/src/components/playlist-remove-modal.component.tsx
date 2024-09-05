import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";
import usePlaylistState from "../states/playlist.state";
import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import { changePlaylistHiddenState } from "../fetchs/playlist.fetch";
import toast from "react-hot-toast";
import queryClient from "../config/query-client.config";

const PlaylistRemoveModal = () => {
  const { activeRemovePlaylistModal, setActiveRemovePlaylistModal } =
    usePlaylistState();
  const { active, playlist } = activeRemovePlaylistModal;

  // handle close modal
  const handleCloseModal = () => {
    setActiveRemovePlaylistModal({ active: false, playlist: null });
  };

  // hander remove playlist mutation
  const { mutate: removeUserPlaylistFromProfile } = useMutation({
    mutationKey: [MutationKey.REMOVE_PLAYLIST_FROM_PROFILE],
    mutationFn: changePlaylistHiddenState,
    onSuccess: () => {
      // close modal
      handleCloseModal();

      // refetch user playlists
      queryClient.invalidateQueries([
        QueryKey.GET_TARGET_PLAYLIST,
      ] as InvalidateQueryFilters);

      toast.success(`"${playlist?.title}" playlist removed from profile`);
    },
    onError: () => {
      toast.error(`Failed to remove "${playlist?.title}" playlist`);
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
          This will remove playlist{" "}
          <span
            className={`
              font-bold
             text-white
             `}
          >
            “{playlist?.title}”
          </span>{" "}
          from your profile, but it will not delete the playlist and you could
          add it again.
        </p>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistRemoveModal;
