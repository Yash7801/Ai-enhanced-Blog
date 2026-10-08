import jwt from "jsonwebtoken";
import { sessionCookieOptions } from "./sessionCookie.js";

export function authenticatedUserId(req, res) {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ message: "Sign in to continue." });
    return null;
  }
  if (!process.env.JWT_SECRET_KEY) {
    console.error("AUTH ERROR: JWT_SECRET_KEY is not configured.");
    res.status(500).json({ message: "Authentication is temporarily unavailable." });
    return null;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return user.id;
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      res.clearCookie("access_token", sessionCookieOptions(req));
      res.status(401).json({ message: "Your session has expired. Please sign in again." });
      return null;
    }
    throw err;
  }
}

export function requireAuth(req, res, next) {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  req.userId = userId;
  next();
}
