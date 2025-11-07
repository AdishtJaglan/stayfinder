import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String, // hashed
    savedHotels: [String], // hotel ids
    quizAnswers: Object,
    lastRecommendations: [String],
    lastRecommendedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
