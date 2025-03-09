import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected Routes Token-Based Authentication
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ success: false, message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Remove "Bearer " and get the token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    console.log("JWT Verification Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

// Admin Access Middleware
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== 1) {
      return res.status(403).json({ success: false, message: "Unauthorized Access" });
    }
    next();
  } catch (error) {
    console.log("Admin Middleware Error:", error);
    res.status(500).json({ success: false, message: "Error in Admin Middleware" });
  }
};

