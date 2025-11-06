// models/Hotel.js
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    city: String,
    price_per_night: Number,
    rating: Number,
    tags: [String],
    sdg_tags: [String],
    images: [String],
    description: String,
    coords: { lat: Number, lng: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
