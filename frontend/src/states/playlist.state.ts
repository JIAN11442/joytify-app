import { create } from "zustand";
import { resPlaylist } from "../constants/data-type.constant";

export type PlaylistState = {
  userPlaylists: resPlaylist[] | null;
  targetPlaylist: resPlaylist | null;

  setUserPlaylists: (playlists: resPlaylist[] | null) => void;
  setTargetPlaylist: (playlist: resPlaylist | null) => void;
};

const usePlaylistState = create<PlaylistState>((set) => ({
  userPlaylists: null,
  targetPlaylist: null,

  setUserPlaylists: (playlists) => set({ userPlaylists: playlists }),
  setTargetPlaylist: (playlist) => set({ targetPlaylist: playlist }),
}));

export default usePlaylistState;
