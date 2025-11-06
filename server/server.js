import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import hotelRoutes from "./routes/hotels.routes.js";
import recommendRoutes from "./routes/recommend.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/recommend", recommendRoutes);

app.listen(5000, () => console.log("API running on port 5000"));
