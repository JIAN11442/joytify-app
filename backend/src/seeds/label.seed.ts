import LabelOptions from "../constants/label.constant";

const defaultLanguageLabel = [
  { label: "English", type: LabelOptions.LANGUAGE, default: true },
  { label: "Chinese", type: LabelOptions.LANGUAGE, default: true },
  { label: "Japanese", type: LabelOptions.LANGUAGE, default: true },
  { label: "Korean", type: LabelOptions.LANGUAGE, default: true },
  { label: "Spanish", type: LabelOptions.LANGUAGE, default: true },
  { label: "French", type: LabelOptions.LANGUAGE, default: true },
  { label: "Italian", type: LabelOptions.LANGUAGE, default: true },
  { label: "Malay", type: LabelOptions.LANGUAGE, default: true },
  { label: "German", type: LabelOptions.LANGUAGE, default: true },
  { label: "Portuguese", type: LabelOptions.LANGUAGE, default: true },
  { label: "Russian", type: LabelOptions.LANGUAGE, default: true },
  { label: "Hindi", type: LabelOptions.LANGUAGE, default: true },
  { label: "Turkish", type: LabelOptions.LANGUAGE, default: true },
  { label: "Greek", type: LabelOptions.LANGUAGE, default: true },
  { label: "Swedish", type: LabelOptions.LANGUAGE, default: true },
  { label: "Dutch", type: LabelOptions.LANGUAGE, default: true },
];

const defaultGenreLabel = [
  { label: "Pop", type: LabelOptions.GENRE, default: true },
  { label: "Rock", type: LabelOptions.GENRE, default: true },
  { label: "Hip-Hop", type: LabelOptions.GENRE, default: true },
  { label: "Jazz", type: LabelOptions.GENRE, default: true },
  { label: "Classical", type: LabelOptions.GENRE, default: true },
  { label: "Electronic", type: LabelOptions.GENRE, default: true },
  { label: "Country", type: LabelOptions.GENRE, default: true },
  { label: "Reggae", type: LabelOptions.GENRE, default: true },
  { label: "Blues", type: LabelOptions.GENRE, default: true },
  { label: "Metal", type: LabelOptions.GENRE, default: true },
  { label: "Folk", type: LabelOptions.GENRE, default: true },
];

const defaultTagLabel = [
  { label: "Happy", type: LabelOptions.TAG, default: true },
  { label: "Sad", type: LabelOptions.TAG, default: true },
  { label: "Energetic", type: LabelOptions.TAG, default: true },
  { label: "Melancholic", type: LabelOptions.TAG, default: true },
  { label: "Romantic", type: LabelOptions.TAG, default: true },
  { label: "Chill", type: LabelOptions.TAG, default: true },
  { label: "Uplifting", type: LabelOptions.TAG, default: true },
];

const defaultThemeLabel = [
  { label: "Love", type: LabelOptions.THEME, default: true },
  { label: "Heartbreak", type: LabelOptions.THEME, default: true },
  { label: "Party", type: LabelOptions.THEME, default: true },
  { label: "Friendship", type: LabelOptions.THEME, default: true },
  { label: "Social Issues", type: LabelOptions.THEME, default: true },
  { label: "Life", type: LabelOptions.THEME, default: true },
  { label: "Nature", type: LabelOptions.THEME, default: true },
];

const defaultFeatureLabel = [
  { label: "Acoustic", type: LabelOptions.FEATURE, default: true },
  { label: "Live", type: LabelOptions.FEATURE, default: true },
  { label: "Cover", type: LabelOptions.FEATURE, default: true },
  { label: "Remix", type: LabelOptions.FEATURE, default: true },
  { label: "Instrumental", type: LabelOptions.FEATURE, default: true },
  { label: "Acapella", type: LabelOptions.FEATURE, default: true },
  { label: "Remastered", type: LabelOptions.FEATURE, default: true },
  { label: "Demo", type: LabelOptions.FEATURE, default: true },
];

const defaultRegionLabel = [
  { label: "Latin", type: LabelOptions.REGION, default: true },
  { label: "African", type: LabelOptions.REGION, default: true },
  { label: "Asian", type: LabelOptions.REGION, default: true },
  { label: "Indie", type: LabelOptions.REGION, default: true },
  { label: "North American", type: LabelOptions.REGION, default: true },
  { label: "South American", type: LabelOptions.REGION, default: true },
  { label: "European", type: LabelOptions.REGION, default: true },
];

const defaultLabels = [
  ...defaultLanguageLabel,
  ...defaultGenreLabel,
  ...defaultTagLabel,
  ...defaultThemeLabel,
  ...defaultFeatureLabel,
  ...defaultRegionLabel,
  // { label: "User Created Label", type: LabelOptions.CREATE, default: false },
];

export default defaultLabels;
