export enum MutationKey {
  SIGNIN = "signin",
  SIGNUP = "signup",
  LOGOUT = "logout",
  THIRD_PARTY_AUTH = "third-party-auth",
  UPLOAD_SONG_INFO = "upload-song-info",
  UPLOAD_SONG_FILE = "upload-song-file",
  UPLOAD_IMAGE_FILE = "upload-image-file",
  CREATE_NEW_SONG = "create-new-song",
  SEND_RESET_PASSWORD_EMAIL = "send-reset-password-email",
  CREATE_USER_PLAYLIST = "create-user-playlist",
}

export enum QueryKey {
  GET_USER_INFO = "get-user-info",
  GET_USER_PLAYLISTS = "get-user-playlists",
  GET_TARGET_PLAYLIST = "get-target-playlist",
}
