enum SongLoopOptions {
  OFF = "off",
  TRACK = "track",
  PLAYLIST = "playlist",
}

export type SongLoopType =
  (typeof SongLoopOptions)[keyof typeof SongLoopOptions];

export default SongLoopOptions;
