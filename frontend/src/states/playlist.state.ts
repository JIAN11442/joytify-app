import { create } from "zustand";
import { resPlaylist } from "../constants/data-type.constant";
import { ArrangementType } from "../constants/arrangement-type.constant";

export type PlaylistModalType = {
  active: boolean;
  playlist: resPlaylist | null;
};

export type PlaylistState = {
  userPlaylists: resPlaylist[] | null;
  targetPlaylist: resPlaylist | null;
  activePlaylistEditModal: PlaylistModalType;
  activeDeletePlaylistModal: PlaylistModalType;
  activeRemovePlaylistModal: PlaylistModalType;
  activePlaylistEditOptionsMenu: boolean;
  activePlaylistListOptionsMenu: boolean;
  coverImageSrc: string;
  songArrangementType: ArrangementType;

  setUserPlaylists: (playlists: resPlaylist[] | null) => void;
  setTargetPlaylist: (playlist: resPlaylist | null) => void;
  setActivePlaylistEditModal: (active: PlaylistModalType) => void;
  setActiveDeletePlaylistModal: (active: PlaylistModalType) => void;
  setActiveRemovePlaylistModal: (active: PlaylistModalType) => void;
  setActivePlaylistEditOptionsMenu: (state: boolean) => void;
  setActivePlaylistListOptionsMenu: (state: boolean) => void;
  setCoverImageSrc: (src: string) => void;
  setSongArrangementType: (type: ArrangementType) => void;

  closePlaylistEditModal: () => void;
};

const usePlaylistState = create<PlaylistState>((set) => ({
  userPlaylists: null,
  targetPlaylist: null,
  activePlaylistEditModal: { active: false, playlist: null },
  activeDeletePlaylistModal: { active: false, playlist: null },
  activeRemovePlaylistModal: { active: false, playlist: null },
  activePlaylistEditOptionsMenu: false,
  activePlaylistListOptionsMenu: false,
  coverImageSrc: "",
  songArrangementType: "list",

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
  setCoverImageSrc: (src) => set({ coverImageSrc: src }),
  setSongArrangementType: (type) => set({ songArrangementType: type }),

  closePlaylistEditModal: () =>
    set({ activePlaylistEditModal: { active: false, playlist: null } }),
}));

export default usePlaylistState;
