import Modal from "./modal.component";
import PlaylistWarningContent from "./playlist-warning-content.component";

import { useUpdatePlaylistMutation } from "../hooks/playlist-mutate.hook";
import { PrivacyOptions } from "@joytify/shared-types/constants";
import { RefactorPlaylistResponse } from "@joytify/shared-types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { FormattedMessage } from "react-intl";
import { useScopedIntl } from "../hooks/intl.hook";

const PlaylistPrivacyModal = () => {
  const { fm } = useScopedIntl();
  const prefix = "playlist.privacy.modal";
  const playlistPrivacyModalFm = fm(prefix);

  const { activePlaylistPrivacyModal, setActivePlaylistPrivacyModal } = usePlaylistState();
  const { active, playlist } = activePlaylistPrivacyModal;
  const { _id: playlistId } = (playlist as RefactorPlaylistResponse) ?? {};

  const { PUBLIC, PRIVATE } = PrivacyOptions;
  const isPublic = playlist?.privacy === PUBLIC;

  const handleCloseModal = () => {
    setActivePlaylistPrivacyModal({ active: false, playlist: null });
  };

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
        executeBtnText={playlistPrivacyModalFm("execute.button.submit")}
        closeModalFn={handleCloseModal}
        executeFn={handleSwitchPlaylistPrivacy}
      >
        {/* Warning text */}
        <p className={`text-red-500`}>
          <FormattedMessage
            id={`${prefix}.warning.text`}
            values={{
              playlist: playlist?.title,
              strong: (chunks) => <strong className={`text-white`}>{chunks}</strong>,
            }}
          />
        </p>
      </PlaylistWarningContent>
    </Modal>
  );
};

export default PlaylistPrivacyModal;
