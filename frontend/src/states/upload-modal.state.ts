import { create } from "zustand";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { OptionType } from "../components/multi-select-input-box.component";
import LabelOptions, { LabelType } from "../constants/label.constant";
import {
  refactorResLabel,
  resAlbum,
} from "../constants/axios-response.constant";

export type RefetchType<T> = (
  options?: RefetchOptions
) => Promise<QueryObserverResult<T | undefined, Error>>;

type LabelModalType = {
  type: LabelType;
  active: boolean;
  options: OptionType | OptionType[] | null;
  labelRefetch: RefetchType<refactorResLabel> | null;
};

type PlaylistModalType = {
  active: boolean;
  options: string[] | null;
};

type AlbumModalType = {
  active: boolean;
  options: string[] | null;
  albumRefetch: RefetchType<resAlbum[]> | null;
};

type UploadModalState = {
  activeUploadModal: boolean;
  activeAdvancedSettings: boolean;
  activeCreateLabelModal: LabelModalType;
  activeCreatePlaylistModal: PlaylistModalType;
  activeCreateAlbumModal: AlbumModalType;

  openUploadModal: () => void;
  closeUploadModal: () => void;
  setActiveAdvancedSettings: (active: boolean) => void;
  setActiveCreateLabelModal: (state: LabelModalType) => void;
  setActiveCreatePlaylistModal: (state: PlaylistModalType) => void;
  setActiveCreateAlbumModal: (state: AlbumModalType) => void;
};

const useUploadModalState = create<UploadModalState>((set) => ({
  activeUploadModal: false,
  activeAdvancedSettings: false,
  activeCreateLabelModal: {
    type: LabelOptions.NULL,
    active: false,
    options: null,
    labelRefetch: null,
  },
  activeCreatePlaylistModal: { active: false, options: null },
  activeCreateAlbumModal: { active: false, options: null, albumRefetch: null },

  openUploadModal: () => set({ activeUploadModal: true }),
  closeUploadModal: () =>
    set({ activeUploadModal: false, activeAdvancedSettings: false }),
  setActiveAdvancedSettings: (active) =>
    set({ activeAdvancedSettings: active }),
  setActiveCreateLabelModal: (state) => set({ activeCreateLabelModal: state }),
  setActiveCreatePlaylistModal: (state) =>
    set({ activeCreatePlaylistModal: state }),
  setActiveCreateAlbumModal: (state) => set({ activeCreateAlbumModal: state }),
}));

export default useUploadModalState;
