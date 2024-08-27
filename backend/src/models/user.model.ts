import mongoose from "mongoose";
import { CompareHashValue, HashValue } from "../utils/bcrypt.util";
import {
  profile_collections,
  profile_names,
} from "../constants/profile-img.constant";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  verified: boolean;
  profile_img: string;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword(): Omit<this, "password">;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false, required: true },
    profile_img: {
      type: String,
      default: () =>
        `https://api.dicebear.com/6.x/${
          profile_collections[
            Math.floor(Math.random() * profile_collections.length)
          ]
        }/svg?seed=${
          profile_names[Math.floor(Math.random() * profile_names.length)]
        }`,
    },
  },
  { timestamps: true }
);

// pre (hash password before savings)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await HashValue(this.password);
  return next();
});

// custom method (compare password with hashed password from database)
userSchema.methods.comparePassword = async function (password: string) {
  return CompareHashValue(password, this.password);
};

// custom method (omit password from user object)
userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
