import { create } from "zustand";
import { SongDeleteStatus } from "@joytify/types/constants";
import { MusicianResponse, RefactorSongResponse, SongDeleteStatusType } from "@joytify/types/types";

type ActiveSongDeleteModal = {
  active: boolean;
  song: RefactorSongResponse | null;
  status: SongDeleteStatusType;
};

type ActiveMusicianUnFollowModal = {
  active: boolean;
  musician: MusicianResponse | null;
};

type ManagesState = {
  activeSongDeleteModal: ActiveSongDeleteModal;
  activeMusicianUnFollowModal: ActiveMusicianUnFollowModal;
  setActiveSongDeleteModal: (state: ActiveSongDeleteModal) => void;
  setActiveMusicianUnFollowModal: (state: ActiveMusicianUnFollowModal) => void;
};

const { INITIAL_CONFIRMATION } = SongDeleteStatus;

const useManagesState = create<ManagesState>((set) => ({
  activeSongDeleteModal: { active: false, song: null, status: INITIAL_CONFIRMATION },
  activeMusicianUnFollowModal: { active: false, musician: null },
  setActiveSongDeleteModal: (state) => set({ activeSongDeleteModal: state }),
  setActiveMusicianUnFollowModal: (state) => set({ activeMusicianUnFollowModal: state }),
}));

export default useManagesState;
