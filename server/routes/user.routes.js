import express from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/user/preferences
router.get("/preferences", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select(
    "quizAnswers lastRecommendations lastRecommendedAt savedHotels"
  );
  res.json({
    preferences: user?.quizAnswers || null,
    lastRecommendations: user?.lastRecommendations || [],
    savedHotels: user?.savedHotels || [],
  });
});

// POST /api/user/preferences
router.post("/preferences", requireAuth, async (req, res) => {
  const { quizAnswers } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { quizAnswers },
    { new: true }
  ).select("-password");
  res.json({ user });
});

// GET /api/user/wishlist
router.get("/wishlist", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ wishlist: user.savedHotels || [] });
});

// POST /api/user/wishlist  { hotelId }
router.post("/wishlist", requireAuth, async (req, res) => {
  const { hotelId } = req.body;
  const user = await User.findById(req.userId);
  user.savedHotels = Array.from(
    new Set([...(user.savedHotels || []), hotelId])
  );
  await user.save();
  res.json({ wishlist: user.savedHotels });
});

// DELETE /api/user/wishlist/:hotelId
router.delete("/wishlist/:hotelId", requireAuth, async (req, res) => {
  const hotelId = req.params.hotelId;
  const user = await User.findById(req.userId);
  user.savedHotels = (user.savedHotels || []).filter((h) => h !== hotelId);
  await user.save();
  res.json({ wishlist: user.savedHotels });
});

export default router;
