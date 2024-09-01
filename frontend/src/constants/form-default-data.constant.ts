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

export type DefaultsAuthType = typeof defaultsLoginData & {
  confirmPassword?: string;
};
export type DefaultsSongType = typeof defaultsSongData;

export type DefaultsResetPasswordType = typeof defaultsResetPasswordData;
