import { create } from "zustand";
import {
  refactorResPlaylist,
  resPlaylist,
} from "../constants/axios-response.constant";
import ArrangementOptions, {
  ArrangementType,
} from "../constants/arrangement.constant";

export type PlaylistModalType = {
  active: boolean;
  playlist: refactorResPlaylist | null;
};

type PlaylistState = {
  userPlaylists: resPlaylist[] | null;
  targetPlaylist: refactorResPlaylist | null;
  activePlaylistEditModal: PlaylistModalType;
  activeDeletePlaylistModal: PlaylistModalType;
  activeRemovePlaylistModal: PlaylistModalType;
  activePlaylistEditOptionsMenu: boolean;
  activePlaylistListOptionsMenu: boolean;
  songArrangementType: ArrangementType;

  setUserPlaylists: (playlists: resPlaylist[] | null) => void;
  setTargetPlaylist: (playlist: refactorResPlaylist | null) => void;
  setActivePlaylistEditModal: (active: PlaylistModalType) => void;
  setActiveDeletePlaylistModal: (active: PlaylistModalType) => void;
  setActiveRemovePlaylistModal: (active: PlaylistModalType) => void;
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
  activeDeletePlaylistModal: { active: false, playlist: null },
  activeRemovePlaylistModal: { active: false, playlist: null },
  activePlaylistEditOptionsMenu: false,
  activePlaylistListOptionsMenu: false,
  songArrangementType: ArrangementOptions.LIST,

  setUserPlaylists: (playlists) => set({ userPlaylists: playlists }),
  setTargetPlaylist: (playlist) => set({ targetPlaylist: playlist }),
  setActivePlaylistEditModal: (active) =>
    set({ activePlaylistEditModal: active }),
  setActiveDeletePlaylistModal: (active) =>
    set({ activeDeletePlaylistModal: active }),
  setActiveRemovePlaylistModal: (active) =>
    set({ activeRemovePlaylistModal: active }),
  setActivePlaylistEditOptionsMenu: (state) =>
    set({ activePlaylistEditOptionsMenu: state }),
  setActivePlaylistListOptionsMenu: (state) =>
    set({ activePlaylistListOptionsMenu: state }),
  setSongArrangementType: (type) => set({ songArrangementType: type }),

  closePlaylistEditModal: () =>
    set({ activePlaylistEditModal: { active: false, playlist: null } }),
  closePlaylistDeleteModal: () =>
    set({ activeDeletePlaylistModal: { active: false, playlist: null } }),
}));

export default usePlaylistState;
