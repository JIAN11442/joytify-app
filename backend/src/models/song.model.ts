import mongoose from "mongoose";

export interface SongDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  artist: string; // 作者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  playlist_for: mongoose.Types.ObjectId; // 歌曲所屬歌單
  composer: string; // 作曲者
  releaseDate: Date; // 發行日期
  language: string; // 語言
  album: string[]; // 專輯名稱
  genre: string[]; // 流派
  tags: string[]; // 標籤
  lyrics: string[]; // 歌詞
  activity: {
    total_likes: number;
    total_plays: number;
    average_rating: number;
    average_listening_duration: number;
  };
}

const songSchema = new mongoose.Schema<SongDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    songUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    playlist_for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      index: true,
    },
    composer: { type: String },
    releaseDate: { type: Date },
    album: { type: [String] },
    genre: { type: [String] },
    language: { type: String },
    tags: { type: [String] },
    lyrics: { type: [String] },
    activity: {
      total_likes: { type: Number, default: 0 },
      total_plays: { type: Number, default: 0 },
      average_rating: { type: Number, default: 0 },
      average_listening_duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const SongModel = mongoose.model<SongDocument>("Song", songSchema);

export default SongModel;
