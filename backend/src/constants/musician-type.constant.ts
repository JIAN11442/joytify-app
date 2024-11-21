enum MusicianOptions {
  ARTIST = "artist",
  COMPOSER = "composer",
  LYRICIST = "lyricist",
}

export type MusicianType =
  (typeof MusicianOptions)[keyof typeof MusicianOptions];

export default MusicianOptions;
