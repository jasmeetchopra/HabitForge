import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Runs before protected controllers. It reads the JWT, verifies it, looks up
// the user, and attaches them to req.user. If anything is off, it stops the
// request with 401 Unauthorized so the controller never even runs.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // We accept the token two ways:
  // 1) an httpOnly cookie named "token" (set at login) - preferred
  // 2) an "Authorization: Bearer <token>" header (handy for testing tools)
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Load the user but never expose the password hash.
  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user no longer exists");
  }

  req.user = user;
  next();
});
