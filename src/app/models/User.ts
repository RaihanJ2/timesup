import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
