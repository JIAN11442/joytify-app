export enum UploadFolder {
  SONGS_MP3 = "songs/mp3",
  SONGS_IMAGE = "songs/image",
  PLAYLISTS_IMAGE = "playlists/image",
  ALBUMS_IMAGE = "albums/image",
}

export enum FileExtension {
  PNG = ".png",
  JPEG = ".jpeg",
  JPG = ".jpg",
  MP3 = ".mp3",
  GIF = ".gif",
}

export type UploadFolderType = typeof UploadFolder;
export type FileExtensionType = typeof FileExtension;
