import { create } from "zustand";

type AlbumState = {
  deleteAlbum: string;
  setDeletedAlbum: (title: string) => void;
};

const useAlbumState = create<AlbumState>((set) => ({
  deleteAlbum: "",
  setDeletedAlbum: (title) => set({ deleteAlbum: title }),
}));

export default useAlbumState;
