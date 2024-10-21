enum LabelOptions {
  LANGUAGE = "language",
  TAGS = "tags",
  GENRE = "genre",
  THEME = "theme",
  FEATURE = "feature",
  REGION = "region",
  CREATE = "create",
  COMPOSER = "composer",
  ARTIST = "artist",
  NULL = "null",
}

export type LabelType = (typeof LabelOptions)[keyof typeof LabelOptions];

export default LabelOptions;
