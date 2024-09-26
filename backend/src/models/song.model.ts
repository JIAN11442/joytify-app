import mongoose from "mongoose";

export interface SongDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  artist: string; // 作者
  songUrl: string; // 歌曲連結
  imageUrl: string; //封面連結
  duration: number;
  releaseDate: Date; // 發行日期
  playlist_for: mongoose.Types.ObjectId; // 歌曲所屬歌單
  album: mongoose.Types.ObjectId; // 專輯名稱
  composer: mongoose.Types.ObjectId[]; // 作曲者
  language: mongoose.Types.ObjectId[]; // 語言
  genre: mongoose.Types.ObjectId[]; // 流派
  tags: mongoose.Types.ObjectId[]; // 標籤
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
    releaseDate: { type: Date },
    playlist_for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      index: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      index: true,
    },
    composer: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    language: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    genre: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Label",
      index: true,
    },
    tags: { type: [mongoose.Schema.Types.ObjectId], ref: "Label", index: true },
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
