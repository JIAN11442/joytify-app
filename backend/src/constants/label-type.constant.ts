enum LabelOptions {
  LANGUAGE = "language",
  TAG = "tag",
  GENRE = "genre",
  THEME = "theme",
  FEATURE = "feature",
  REGION = "region",
  ALBUM = "album",
  CREATE = "create",
  NULL = "null",
}

export type LabelType = (typeof LabelOptions)[keyof typeof LabelOptions];

export default LabelOptions;
