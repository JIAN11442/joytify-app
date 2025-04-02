import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";

import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistPrivacyModal = () => {
  const { activePlaylistPrivacyModal, setActivePlaylistPrivacyModal } = usePlaylistState();
  const { active, playlist } = activePlaylistPrivacyModal;
  const { _id: playlistId } = (playlist as RefactorPlaylistResponse) ?? {};

  const { PUBLIC, PRIVATE } = PrivacyOptions;
  const isPublic = playlist?.privacy === PUBLIC;

  // handle close modal
  const handleCloseModal = () => {
    setActivePlaylistPrivacyModal({ active: false, playlist: null });
  };

  // handle switch playlist privacy
  const handleSwitchPlaylistPrivacy = () => {
    timeoutForDelay(() => {
      updatePlaylistFn({ privacy: isPublic ? PRIVATE : PUBLIC });
    });
  };

  // handle update playlist mutation
  const { mutate: updatePlaylistFn } = useUpdatePlaylistMutation(playlistId, handleCloseModal);

  return (
    <Modal activeState={active} closeModalFn={handleCloseModal}>
      <PlaylistWarningContent
        playlist={playlist}
        executeBtnText="Make private"
        closeModalFn={handleCloseModal}
        executeFn={handleSwitchPlaylistPrivacy}
      >
        {/* Warning text */}
        <p className={`text-red-500/80`}>
          This will privatize the playlist{" "}
          <span className={`font-bold text-white`}>{playlist?.title}</span>, making it invisible to
          others and removing it from your profile. You can make it public again at any time.
        </p>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistPrivacyModal;
