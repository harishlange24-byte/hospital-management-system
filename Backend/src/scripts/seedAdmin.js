/**
 * Create an initial admin user.
 * Usage: node src/scripts/seedAdmin.js
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL || "admin@hospital.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Hospital Admin",
      email,
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
    });

    console.log("Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit(0);
  } catch (error) {
    console.error("Seed admin failed:", error);
    process.exit(1);
  }
};

seedAdmin();
