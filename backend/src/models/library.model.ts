import mongoose from "mongoose";

export interface LibraryDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  playlists: mongoose.Types.ObjectId[];
}

const librarySchema = new mongoose.Schema<LibraryDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    playlists: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Playlist",
      index: true,
    },
  },
  { timestamps: true }
);

const LibraryModel = mongoose.model<LibraryDocument>("Library", librarySchema);

export default LibraryModel;
