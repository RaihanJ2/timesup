// src/app/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
  name: String,
  // Other user fields
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
