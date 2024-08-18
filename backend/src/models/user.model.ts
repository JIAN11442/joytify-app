import mongoose from "mongoose";
import { CompareHashValue, HashValue } from "../utils/bcrypt.util";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  verified: boolean;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword(): Omit<this, "password">;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false, required: true },
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
