// routes/hotels.routes.js
import express from "express";
import { hotelsRich } from "../data/hotels-rich.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json(hotelsRich);
});

router.get("/:id", (req, res) => {
  const hotel = hotelsRich.find((h) => h.id === req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
});

export default router;
