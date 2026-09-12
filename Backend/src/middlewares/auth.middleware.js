import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Cookie se token nikalo
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    // 2. JWT verify karo
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 3. Token se user find karo
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 4. Check account active hai ya nahi
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // 5. User ko request ke andar attach karo
    req.user = user;

    // 6. Next middleware/controller
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);

    // JWT expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Invalid JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};