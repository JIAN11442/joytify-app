// ===================== Select Properties Types =====================
export type Label = {
  id: string;
  label: string;
};

export type Musician = {
  id: string;
  name: string;
};

export type Album = {
  id: string;
  title: string;
};

// ===================== Custom Defined Types =====================
export type DefaultLabels = {
  feature: Label[];
  genre: Label[];
  tag: Label[];
  region: Label[];
  language: Label[];
  theme: Label[];
  album: Label[];
};

export type HexPaletee = {
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  muted: string;
  darkMuted: string;
  lightMuted: string;
};

// ===================== Fetch Response Data Types =====================
export type ResUser = {
  _id: string;
  email: string;
  profile_img: string;
  auth_for_third_party: {
    google: boolean;
    github: boolean;
  };
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ResPlaylist = {
  _id: string;
  user: string;
  title: string;
  description?: string;
  cover_image: string;
  paletee: HexPaletee;
  songs: ResSong[];
  default: boolean;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ResSong = {
  _id: string;
  title: string;
  creator: string;
  artist: Musician[];
  songUrl: string;
  imageUrl: string;
  duration: number;
  releaseDate: Date;
  album: Album;
  lyricists: Musician[];
  composers: Musician[];
  languages: Label[];
  genres: string[];
  tags: string[];
  lyrics: string[];
  playlist_for: string[];
  followers: string[];
  activity: {
    total_likes: number;
    total_plays: number;
    average_rating: number;
    average_listening_duration: number;
  };
  paletee: HexPaletee;
  createdAt: string;
};

export type ResAlbum = {
  _id: string;
  title: string;
  description: string;
  cover_image: string;
  artist: string;
  songs: string[];
  users: string[];
  total_duration: number;
  createdAt: Date;
};

export type ResLabel = {
  _id: string;
  label: string;
  type: string;
  author: string;
  songs: string;
  default: boolean;
  createdAt: Date;
};

// ===================== Refactor Fetch Response Data Types =====================
export type RefactorResPlaylist = Omit<ResPlaylist, "songs"> & {
  songs: RefactorResSong[];
};

export type RefactorResSong = Omit<
  ResSong,
  "artist" | "composers" | "lyricists" | "languages" | "album"
> & {
  artist: string;
  composers: string;
  languages: string;
  lyricists: string;
  album: string;
};

export type RefactorResLabel = {
  default: DefaultLabels;
  created: DefaultLabels;
};
