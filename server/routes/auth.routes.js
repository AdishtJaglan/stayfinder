// routes/auth.routes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  res.json({ message: "Registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "No user" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
  res.json({ token, user });
});

export default router;
