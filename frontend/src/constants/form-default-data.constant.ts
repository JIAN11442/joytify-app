export const defaultsSongData = {
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

export const defaultsLoginData = {
  email: "",
  password: "",
};

export const defaultsRegisterData = {
  ...defaultsLoginData,
  confirmPassword: "",
};

export const defaultsResetPasswordData = {
  email: "",
};

export const defaultsPlaylistEditData = {
  coverImage: undefined,
  title: "",
  description: "",
};

export const defaultsCreateLabelData = {
  label: "",
};

export const defaultsMovingPlaylistData = {
  playlist_for: "",
};

export const defaultsCreatePlaylistData = {
  playlist: "",
};

// Types
export type DefaultsAuthType = typeof defaultsLoginData & {
  confirmPassword?: string;
};

export type DefaultsSongType = typeof defaultsSongData;
export type DefaultsResetPasswordType = typeof defaultsResetPasswordData;
export type DefaultsPlaylistEditType = typeof defaultsPlaylistEditData;
export type DefaultsCreateLabelType = typeof defaultsCreateLabelData;
export type DefaultsMovingPlaylistType = typeof defaultsMovingPlaylistData;
export type DefaultsCreatePlaylistType = typeof defaultsCreatePlaylistData;
