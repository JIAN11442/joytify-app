import { create } from "zustand";
import { SongDeleteStatus } from "@joytify/shared-types/constants";
import { RefactorSongResponse, SongDeleteStatusType } from "@joytify/shared-types/types";

type ActiveSongDeleteModal = {
  active: boolean;
  song: RefactorSongResponse | null;
  status: SongDeleteStatusType;
};

type ManagesState = {
  activeSongDeleteModal: ActiveSongDeleteModal;
  setActiveSongDeleteModal: (state: ActiveSongDeleteModal) => void;
};

const { INITIAL_CONFIRMATION } = SongDeleteStatus;

const useManagesState = create<ManagesState>((set) => ({
  activeSongDeleteModal: { active: false, song: null, status: INITIAL_CONFIRMATION },
  setActiveSongDeleteModal: (state) => set({ activeSongDeleteModal: state }),
}));

export default useManagesState;
