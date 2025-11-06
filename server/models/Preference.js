// models/Preference.js
import mongoose from "mongoose";

const prefSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    query: Object, // search filters
  },
  { timestamps: true }
);

export default mongoose.model("Preference", prefSchema);
