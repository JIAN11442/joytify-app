import {
  FieldValues,
  Path,
  PathValue,
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

// ===================== Initial Form Data =====================
export const defaultSongData = {
  title: null as string | null,
  artist: null as string[] | null,
  songFile: null as FileList | null,
  playlist_for: null as string | null,
  imageFile: undefined as FileList | undefined,
  album: undefined as string | undefined,
  lyricists: undefined as string[] | undefined,
  composers: undefined as string[] | undefined,
  languages: undefined as string[] | undefined,
  genres: undefined as string[] | undefined,
  tags: undefined as string[] | undefined,
  lyrics: undefined as string[] | undefined,
  releaseDate: undefined as string | undefined,
};

export const defaultLoginData = {
  email: "",
  password: "",
};

export const defaultRegisterData = {
  ...defaultLoginData,
  confirmPassword: "",
};

export const defaultResetPasswordData = {
  email: "",
};

export const defaultPlaylistEditData = {
  coverImage: "",
  title: "",
  description: "",
};

export const defaultCreateLabelData = {
  label: "",
};

export const defaultMovingPlaylistData = {
  playlist_for: "",
};

export const defaultCreatePlaylistData = {
  playlist: "",
};

export const defaultCreateAlbumData = {
  title: null as string | null,
  description: undefined as string | undefined,
  imageFile: undefined as FileList | undefined,
  artist: undefined as string | undefined,
};

// ===================== Form Data Types =====================
export type AuthForm = typeof defaultLoginData & {
  confirmPassword?: string;
};

export type SongForm = typeof defaultSongData;
export type ResetPasswordForm = typeof defaultResetPasswordData;
export type EditPlaylistForm = typeof defaultPlaylistEditData;
export type CreateLabelForm = typeof defaultCreateLabelData;
export type MovingPlaylistForm = typeof defaultMovingPlaylistData;
export type CreatePlaylistForm = typeof defaultCreatePlaylistData;
export type CreateAlbumForm = typeof defaultCreateAlbumData;

export type AuthFormKeys = keyof AuthForm;
export type SongFormKeys = keyof SongForm;
export type EditPlaylistFormKeys = keyof EditPlaylistForm;

export type FormMethods<T extends FieldValues> = {
  setFormValue: UseFormSetValue<T>;
  setFormError: UseFormSetError<T>;
  trigger: UseFormTrigger<T>;
};

export type FormPathValue<T extends FieldValues> = PathValue<T, Path<T>>;
