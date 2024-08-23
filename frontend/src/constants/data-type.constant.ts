export type resUser = {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  | "songComposer";
