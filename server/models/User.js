// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String, // bcrypt hash
    savedHotels: [{ type: String }], // hotel IDs
    quizAnswers: Object,
    lastRecommendations: [String],
    lastRecommendedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
