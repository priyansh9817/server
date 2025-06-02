import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Ensure correct import

// Middleware to verify user authentication
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

// Middleware to verify admin access
export const isAdmin = async (req, res, next) => {
  try {
    // ✅ Ensure user ID is correctly retrieved
    const user = await userModel.findById(req.user?._id); // Use `id` instead of `_id`

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied: Admins Only" });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server Error in Admin Middleware" });
  }
};
