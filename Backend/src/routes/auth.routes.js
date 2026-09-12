import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);


// ==========================================
// PROTECTED ROUTES
// ==========================================

// Get currently logged-in user
router.get("/me", protect, getMe);


export default router;