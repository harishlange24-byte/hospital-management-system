export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // protect middleware se req.user aana chahiye
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    // Check user role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    // Role allowed
    next();
  };
};