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
  UPDATE_PLAYLIST = "update-playlist",
  DELETE_PLAYLIST = "delete-playlist",
  REMOVE_PLAYLIST_FROM_PROFILE = "remove-playlist-from-profile",
  ADD_PLAYLIST_TO_PROFILE = "add-playlist-to-profile",
  CREATE_LABEL_OPTION = "create-label-option",
  DELETE_LABEL_OPTION = "delete-label-option",
}

export enum QueryKey {
  GET_USER_INFO = "get-user-info",
  GET_USER_PLAYLISTS = "get-user-playlists",
  GET_TARGET_PLAYLIST = "get-target-playlist",
  GET_SONG_BY_ID = "get-song-by-id",
  GET_ALL_LABELS = "get-all-labels",
}
