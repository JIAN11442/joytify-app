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
  songs: string[];
  default: boolean;
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
