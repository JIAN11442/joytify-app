export const defaultSongData = {
  title: "",
  artist: "",
  songFile: null as FileList | null,
  playlist_for: "",
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

export const defaultForgotPasswordData = {
  email: "",
};

export const defaultResetPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
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
  title: "",
  description: undefined as string | undefined,
  imageFile: undefined as FileList | undefined,
  artist: undefined as string | undefined,
};

export const defaultVerificationCodeInput = {
  letter: "",
  numbers: Array(6).fill(""),
};

export const defaultProfileEditData = {
  profileImage: "",
  username: "",
};
