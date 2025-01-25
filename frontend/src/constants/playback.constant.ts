enum PlaybackStateOptions {
  COMPLETED = "completed",
  PLAYING = "playing",
}

export type PlaybackStateType =
  (typeof PlaybackStateOptions)[keyof typeof PlaybackStateOptions];

export default PlaybackStateOptions;
