export const defaultsSongData = {
  title: "",
  artist: "",
  songFile: null as FileList | null,
  imageFile: null as FileList | null,
  songComposer: "",
  language: "",
  album: [],
  genre: [],
  tags: [],
  lyrics: [],
  playlist_for: "",
  releaseDate: "",
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

// Types
export type DefaultsAuthType = typeof defaultsLoginData & {
  confirmPassword?: string;
};
export type DefaultsSongType = typeof defaultsSongData;

export type DefaultsResetPasswordType = typeof defaultsResetPasswordData;

export type DefaultsPlaylistEditType = typeof defaultsPlaylistEditData;
