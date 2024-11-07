enum LabelOptions {
  LANGUAGE = "language",
  TAGS = "tags",
  GENRE = "genre",
  THEME = "theme",
  FEATURE = "feature",
  REGION = "region",
  COMPOSER = "composer",
  LYRICIST = "lyricist",
  ARTIST = "artist",
  ALBUM = "album",
  CREATE = "create",
  NULL = "null",
}

export type LabelType = (typeof LabelOptions)[keyof typeof LabelOptions];

export default LabelOptions;
