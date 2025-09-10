import { FaStar } from "react-icons/fa";
import { PiPlaylist } from "react-icons/pi";
import { TbTrashXFilled } from "react-icons/tb";
import { IconName } from "../components/react-icons.component";
import { SongDeleteStatus } from "@joytify/types/constants";
import { RefactorSongResponse } from "@joytify/types/types";
import useManagesState from "../states/manages.state";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ManageSongsCardActionsRequest = {
  song: RefactorSongResponse;
  isRated: boolean;
};

type ManageSongsCardActionsResponse = {
  id: string;
  icon: { name: IconName; size: number };
  color: string;
  hidden?: boolean;
  onClick: () => void;
};

export const getManageSongsCardActionsContent = ({
  song,
  isRated,
}: ManageSongsCardActionsRequest): ManageSongsCardActionsResponse[] => {
  const { INITIAL_CONFIRMATION } = SongDeleteStatus;
  const { setActiveSongDeleteModal } = useManagesState.getState();
  const { setActiveSongRateModal, setActiveSongAssignmentModal } = useSongState.getState();

  const activeSongRateModalFn = () => {
    timeoutForDelay(() => {
      setActiveSongRateModal({ active: true, song });
    });
  };

  const activeSongDeleteModalFn = () => {
    timeoutForDelay(() => {
      setActiveSongDeleteModal({ active: true, song, status: INITIAL_CONFIRMATION });
    });
  };

  const activeSongAssignmentModalFn = () => {
    timeoutForDelay(() => {
      setActiveSongAssignmentModal({ active: true, song });
    });
  };

  const actions = [
    {
      id: "rate",
      icon: { name: FaStar, size: 18 },
      color: "#fde047",
      hidden: isRated,
      onClick: activeSongRateModalFn,
    },
    {
      id: "playlist",
      icon: { name: PiPlaylist, size: 18 },
      color: "#7dd3fc",
      onClick: activeSongAssignmentModalFn,
    },
    {
      id: "delete",
      icon: { name: TbTrashXFilled, size: 18 },
      color: "#ef4444",
      onClick: activeSongDeleteModalFn,
    },
  ];

  return actions;
};
