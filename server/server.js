import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import hotelsRoutes from "./routes/hotels.routes.js";
import recommendRoutes from "./routes/recommend.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelsRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/user", userRoutes);

const port = process.env.PORT || 5000;

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Mongo connected");
    } else {
      console.warn(
        "MONGO_URI not set — skipping DB connect (some routes may fail)."
      );
    }
    app.listen(port, () => console.log(`API listening on ${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
