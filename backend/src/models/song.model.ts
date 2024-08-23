import mongoose from "mongoose";

export interface SongDocument extends mongoose.Document {
  title: string;
  artist: string; // 作者
  songUrl: string; // 歌曲連結
  coverArtUrl: string; //封面連結
  composer: string; // 作曲者
  releaseDate: Date; // 發行日期
  album: string; // 專輯名稱
  genre: string; // 流派
  language: string; // 語言
  tags: string[]; // 標籤
  lyrics: string[]; // 歌詞
  activity: {
    total_likes: number;
    total_plays: number;
    average_rating: number;
    average_listening_duration: number;
  };
}

const songSchema = new mongoose.Schema<SongDocument>({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  songUrl: { type: String, required: true },
  coverArtUrl: { type: String, required: true },
  composer: { type: String },
  releaseDate: { type: Date },
  album: { type: String },
  genre: { type: String },
  language: { type: String },
  tags: { type: [String] },
  lyrics: { type: [String] },
  activity: {
    total_likes: { type: Number, default: 0 },
    total_plays: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    average_listening_duration: { type: Number, default: 0 },
  },
});

const songModel = mongoose.model<SongDocument>("Song", songSchema);

export default songModel;
