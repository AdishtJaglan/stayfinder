import express from "express";
import { hotelsRich } from "../data/hotels-rich.js";

const router = express.Router();

// GET /api/hotels
router.get("/", (req, res) => {
  res.json(hotelsRich);
});

// GET /api/hotels/:id
router.get("/:id", (req, res) => {
  const hotel = hotelsRich.find((h) => h.id === req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
});

export default router;
