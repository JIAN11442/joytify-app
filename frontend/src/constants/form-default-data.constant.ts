export const defaultsSongData = {
  title: null as string | null,
  artist: null as string | null,
  songFile: null as FileList | null,
  imageFile: null as FileList | null,
  playlist_for: null as string | null,
  album: null as string | null,
  composer: null as string[] | null,
  language: null as string[] | null,
  genre: null as string[] | null,
  tags: null as string[] | null,
  lyrics: null as string[] | null,
  releaseDate: null as string | null,
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

// Types
export type DefaultsAuthType = typeof defaultsLoginData & {
  confirmPassword?: string;
};

export type DefaultsSongType = typeof defaultsSongData;

export type DefaultsResetPasswordType = typeof defaultsResetPasswordData;

export type DefaultsPlaylistEditType = typeof defaultsPlaylistEditData;

export type DefaultsCreateLabelType = typeof defaultsCreateLabelData;
