import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Ensure correct import
import formidable from "formidable";
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
// Custom middleware
const formMiddleware = (req, res, next) => {
  const form = formidable({ multiples: false });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(400).json({ success: false, message: "Form parsing error" });
    }

    req.fields = fields;
    req.files = files;
    next();
  });
};
export const formidableMiddleware = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    formMiddleware(req, res, next);
  } else {
    next();
  }
};

