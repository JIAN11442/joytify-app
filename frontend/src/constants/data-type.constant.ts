export type resUser = {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type reqAuth = "email" | "password" | "confirmPassword";

export type reqUpload = "songTitle" | "songAuthor" | "songFile" | "imageFile";
