import { create } from "zustand";
import { RefactorSongResponse } from "@joytify/types/types";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { ArrangementType } from "../types/arragement.type";

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

type ActiveSongEditModal = {
  active: boolean;
  song: RefactorSongResponse | null;
};

type SongState = {
  songs: RefactorSongResponse[] | null;
  activeSongRateModal: ActiveSongRateModal;
  activeSongDetailCardModal: ActiveSongDetailCardModal;
  activeSongAssignmentModal: ActiveSongAssignmentModal;
  activeSongEditModal: ActiveSongEditModal;
  songListArrangementType: ArrangementType;

  setSongs: (songs: RefactorSongResponse[] | null) => void;
  setActiveSongRateModal: (state: ActiveSongRateModal) => void;
  setActiveSongDetailCardModal: (state: ActiveSongDetailCardModal) => void;
  setActiveSongAssignmentModal: (state: ActiveSongAssignmentModal) => void;
  setActiveSongEditModal: (state: ActiveSongEditModal) => void;
  setSongListArrangementType: (type: ArrangementType) => void;
};

const useSongState = create<SongState>((set) => ({
  songs: null,
  activeSongRateModal: { active: false, song: null },
  activeSongDetailCardModal: { active: false, songs: null, currentIndex: 0 },
  activeSongAssignmentModal: { active: false, song: null },
  activeSongEditModal: { active: false, song: null },
  songListArrangementType: ArrangementOptions.LIST,

  setSongs: (songs) => set({ songs }),
  setActiveSongRateModal: (state) => set({ activeSongRateModal: state }),
  setActiveSongDetailCardModal: (state) => set({ activeSongDetailCardModal: state }),
  setActiveSongAssignmentModal: (state) => set({ activeSongAssignmentModal: state }),
  setActiveSongEditModal: (state) => set({ activeSongEditModal: state }),
  setSongListArrangementType: (type) => set({ songListArrangementType: type }),
}));

export default useSongState;
