// routes/recommend.routes.js
import express from "express";
import { hotelsRich } from "../data/hotels-rich.js";

const router = express.Router();

router.post("/", (req, res) => {
  const quiz = req.body;

  // const scored = hotelsRich
  //   .map((h) => ({ hotel: h, ...scoreHotel(h, quiz) }))
  //   .sort((a, b) => b.score - a.score)
  //   .slice(0, 6);

  res.json(hotelsRich);
});

export default router;
