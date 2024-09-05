export type resUser = {
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

export type resPlaylist = {
  _id: string;
  user: string;
  title: string;
  description?: string;
  cover_image: string;
  paletee: {
    vibrant: string;
    darkVibrant: string;
    lightVibrant: string;
    muted: string;
    darkMuted: string;
    lightMuted: string;
  };
  songs: resSong[];
  default: boolean;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type resSong = {
  _id: string;
  userId: string;
  title: string;
  artist: string; // 作者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  composer: string; // 作曲者
  releaseDate: Date; // 發行日期
  language: string; // 語言
  album: string[]; // 專輯名稱
  genre: string[]; // 流派
  tags: string[]; // 標籤
  lyrics: string[]; // 歌詞
  playlist_for: string;
  activity: {
    total_likes: number;
    total_plays: number;
    average_rating: number;
    average_listening_duration: number;
  };
  createdAt: string;
};

export type reqAuth = "email" | "password" | "confirmPassword";

export type reqUpload =
  | "title"
  | "artist"
  | "songFile"
  | "imageFile"
  | "genre"
  | "album"
  | "releaseDate"
  | "songComposer"
  | "playlist_for";

export type reqEditPlaylist = "coverImage" | "title" | "description";
