export const defaultSongData = {
  title: "",
  artist: "",
  songFile: null as FileList | null,
  playlistFor: "",
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

export const defaultUpdatePasswordData = {
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
  playlistFor: "",
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

export const defaultAccountDetailsData = {
  gender: undefined as string | undefined,
  country: undefined as string | undefined,
  dateOfBirth: undefined as string | undefined,
};

export const defaultNotificationPreferencesData = {
  monthlyStatistic: undefined as boolean | undefined,
  followingArtistUpdate: undefined as boolean | undefined,
  systemAnnouncement: undefined as boolean | undefined,
};

export const defaultSongRateData = {
  rating: undefined as number | undefined,
  liked: undefined as boolean | undefined,
  comment: undefined as string | undefined,
};

export const defaultPlaylistAdvancedCreatData = {
  coverImage:
    "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/default-playlist-image.png",
  title: "",
  description: "",
  addedSongs: [] as string[],
};

export const defaultSongEditData = {
  title: "",
  imageUrl: "",
};
