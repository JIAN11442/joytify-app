import { create } from "zustand";
import { ArrangementOptions } from "../constants/arrangement.constant";
import { PlaylistResponse, RefactorPlaylistResponse } from "@joytify/shared-types/types";
import { ArrangementType } from "../types/arragement.type";

export type ActivePlaylistModal = {
  active: boolean;
  playlist: RefactorPlaylistResponse | null;
};

export type ActivePlaylistDeleteModal = {
  active: boolean;
  playlist: RefactorPlaylistResponse | PlaylistResponse | null;
};

export type ActivePlaylistAdvancedEditModal = {
  active: boolean;
  playlistId: string | null;
};

type PlaylistState = {
  userPlaylists: PlaylistResponse[] | null;
  targetPlaylist: RefactorPlaylistResponse | null;
  activePlaylistEditModal: ActivePlaylistModal;
  activePlaylistAdvancedEditModal: ActivePlaylistAdvancedEditModal;
  activePlaylistAdvancedCreateModal: boolean;
  activePlaylistDeleteModal: ActivePlaylistDeleteModal;
  activePlaylistPrivacyModal: ActivePlaylistModal;
  activePlaylistEditOptionsMenu: boolean;
  activePlaylistListOptionsMenu: boolean;
  songArrangementType: ArrangementType;

  setUserPlaylists: (playlists: PlaylistResponse[] | null) => void;
  setTargetPlaylist: (playlist: RefactorPlaylistResponse | null) => void;
  setActivePlaylistEditModal: (active: ActivePlaylistModal) => void;
  setActivePlaylistAdvancedEditModal: (active: ActivePlaylistAdvancedEditModal) => void;
  setActivePlaylistAdvancedCreateModal: (active: boolean) => void;
  setActivePlaylistDeleteModal: (active: ActivePlaylistDeleteModal) => void;
  setActivePlaylistPrivacyModal: (active: ActivePlaylistModal) => void;
  setActivePlaylistEditOptionsMenu: (state: boolean) => void;
  setActivePlaylistListOptionsMenu: (state: boolean) => void;
  setSongArrangementType: (type: ArrangementType) => void;

  closePlaylistEditModal: () => void;
  closePlaylistDeleteModal: () => void;
};

const usePlaylistState = create<PlaylistState>((set) => ({
  userPlaylists: null,
  targetPlaylist: null,
  activePlaylistEditModal: { active: false, playlist: null },
  activePlaylistAdvancedEditModal: { active: false, playlistId: null },
  activePlaylistAdvancedCreateModal: false,
  activePlaylistDeleteModal: { active: false, playlist: null },
  activePlaylistPrivacyModal: { active: false, playlist: null },
  activePlaylistEditOptionsMenu: false,
  activePlaylistListOptionsMenu: false,
  songArrangementType: ArrangementOptions.LIST,

  setUserPlaylists: (playlists) => set({ userPlaylists: playlists }),
  setTargetPlaylist: (playlist) => set({ targetPlaylist: playlist }),
  setActivePlaylistEditModal: (active) => set({ activePlaylistEditModal: active }),
  setActivePlaylistAdvancedEditModal: (active) => set({ activePlaylistAdvancedEditModal: active }),
  setActivePlaylistAdvancedCreateModal: (active) =>
    set({ activePlaylistAdvancedCreateModal: active }),
  setActivePlaylistDeleteModal: (active) => set({ activePlaylistDeleteModal: active }),
  setActivePlaylistPrivacyModal: (active) => set({ activePlaylistPrivacyModal: active }),
  setActivePlaylistEditOptionsMenu: (state) => set({ activePlaylistEditOptionsMenu: state }),
  setActivePlaylistListOptionsMenu: (state) => set({ activePlaylistListOptionsMenu: state }),
  setSongArrangementType: (type) => set({ songArrangementType: type }),

  closePlaylistEditModal: () => set({ activePlaylistEditModal: { active: false, playlist: null } }),
  closePlaylistDeleteModal: () =>
    set({ activePlaylistDeleteModal: { active: false, playlist: null } }),
}));

export default usePlaylistState;
