import { FaStar } from "react-icons/fa";
import { TbArrowRightToArc } from "react-icons/tb";
import { RiPlayListAddLine } from "react-icons/ri";
import { IconName } from "../components/react-icons.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/types/types";
import useSongState from "../states/song.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";

type SongTableListAction = {
  id: string;
  title: string;
  icon: { name: IconName; size?: number };
  onClick: (song: RefactorSongResponse) => void;
};

export const getSongTableListActionsContent = (fm: ScopedFormatMessage): SongTableListAction[] => {
  const songTableListActionsFm = fm("song.tableList.actions");

  const { setActiveSongAssignmentModal, setActiveSongRateModal } = useSongState.getState();

  const handleNavigateToSongPage = (song: RefactorSongResponse) => {
    const { _id: songId } = song;

    timeoutForDelay(() => {
      navigate(`/song/${songId}`);
    });
  };

  const handleActiveSongAssignmentModal = (song: RefactorSongResponse) => {
    timeoutForDelay(() => {
      setActiveSongAssignmentModal({ active: true, song });
    });
  };

  const handleActiveSongRateModal = (song: RefactorSongResponse) => {
    timeoutForDelay(() => {
      setActiveSongRateModal({ active: true, song });
    });
  };

  const actions = [
    {
      id: "song-table-list-actions-rate",
      title: songTableListActionsFm("rate"),
      icon: { name: FaStar },
      onClick: (song: RefactorSongResponse) => handleActiveSongRateModal(song),
    },
    {
      id: "song-table-list-actions-navigate-to-main",
      title: songTableListActionsFm("navigateToMain"),
      icon: { name: TbArrowRightToArc },
      onClick: (song: RefactorSongResponse) => handleNavigateToSongPage(song),
    },
    {
      id: "song-table-list-actions-organize-in-playlists",
      title: songTableListActionsFm("organizeInPlaylists"),
      icon: { name: RiPlayListAddLine },
      onClick: (song: RefactorSongResponse) => handleActiveSongAssignmentModal(song),
    },
  ] as SongTableListAction[];

  return actions;
};
