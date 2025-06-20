import { create } from "zustand";
import { RefactorSongResponse } from "@joytify/shared-types/types";

type ActiveSongRateModal = {
  active: boolean;
  song: RefactorSongResponse | null;
};

type ActiveSongDetailCardModal = Omit<ActiveSongRateModal, "song"> & {
  songs: RefactorSongResponse[] | null;
  currentIndex: number;
};

type ActiveSongAssignmentModal = {
  active: boolean;
  song: RefactorSongResponse | null;
};

type SongState = {
  songs: RefactorSongResponse[] | null;
  activeSongRateModal: ActiveSongRateModal;
  activeSongDetailCardModal: ActiveSongDetailCardModal;
  activeSongAssignmentModal: ActiveSongAssignmentModal;

  setSongs: (songs: RefactorSongResponse[] | null) => void;
  setActiveSongRateModal: (state: ActiveSongRateModal) => void;
  setActiveSongDetailCardModal: (state: ActiveSongDetailCardModal) => void;
  setActiveSongAssignmentModal: (state: ActiveSongAssignmentModal) => void;
};

const useSongState = create<SongState>((set) => ({
  songs: null,
  activeSongRateModal: { active: false, song: null },
  activeSongDetailCardModal: { active: false, songs: null, currentIndex: 0 },
  activeSongAssignmentModal: { active: false, song: null },

  setSongs: (songs) => set({ songs }),
  setActiveSongRateModal: (state) => set({ activeSongRateModal: state }),
  setActiveSongDetailCardModal: (state) => set({ activeSongDetailCardModal: state }),
  setActiveSongAssignmentModal: (state) => set({ activeSongAssignmentModal: state }),
}));

export default useSongState;
