import { MdEditNote } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { IconName } from "../components/react-icons.component";
import { PlaylistResponse } from "@joytify/types/types";
import usePlaylistState from "../states/playlist.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ManagePlaylistsCardActionsRequest = {
  playlist: PlaylistResponse;
};

type ManagePlaylistsCardActionsResponse = {
  id: string;
  icon: { name: IconName; size: number };
  color: string;
  hidden?: boolean;
  onClick: () => void;
};

export const getManagePlaylistsCardActionsContent = (
  props: ManagePlaylistsCardActionsRequest
): ManagePlaylistsCardActionsResponse[] => {
  const { playlist } = props;
  const { setActivePlaylistDeleteModal, setActivePlaylistAdvancedEditModal } =
    usePlaylistState.getState();

  const handleActivePlaylistDeleteModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistDeleteModal({ active: true, playlist: playlist });
    });
  };

  const handleActivePlaylistAdvancedEditModal = () => {
    timeoutForDelay(() => {
      setActivePlaylistAdvancedEditModal({ active: true, playlistId: playlist._id });
    });
  };

  const actions = [
    {
      id: "edit",
      icon: { name: MdEditNote, size: 18 },
      color: "#7dd3fc",
      onClick: handleActivePlaylistAdvancedEditModal,
    },
    {
      id: "delete",
      icon: { name: TbTrashXFilled, size: 18 },
      color: "#f87171",
      hidden: playlist.default,
      onClick: handleActivePlaylistDeleteModal,
    },
  ];

  return actions;
};
