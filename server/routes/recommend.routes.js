import express from "express";
import { hotelsRich } from "../data/hotels-rich.js";
import { scoreHotel } from "../services/recommendation.service.js";

const router = express.Router();

// POST /api/recommend
// body: { tripType, minBudget, maxBudget, amenities: [], locationPref, sdg, guests }
router.post("/", (req, res) => {
  const quiz = req.body || {};
  const scored = hotelsRich
    .map((h) => {
      const { score } = scoreHotel(h, quiz);
      return { hotel: h, score };
    })
    .filter((r) => r.score > 10) // drop garbage
    .sort((a, b) => b.score - a.score);
  res.json({ results: scored.slice(0, 12) });
});

export default router;
