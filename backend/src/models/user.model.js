import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true },
    coverImage: { type: String },
    refreshToken: { type: String },
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// instance methods
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
