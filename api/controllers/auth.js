import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sessionCookieOptions } from "../utils/sessionCookie.js";

function isValidCredentials(username, password) {
  return typeof username === "string"
    && username.trim().length > 0
    && username.trim().length <= 50
    && typeof password === "string"
    && password.length >= 8
    && Buffer.byteLength(password, "utf8") <= 72;
}

export const register = async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;

  if (!isValidCredentials(username, password)) {
    return res.status(400).json({ message: "Use a username of 1–50 characters and a password of 8–72 bytes." });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email],
    );

    if (existing.length) return res.status(409).json({ message: "That username or email is already registered." });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      "INSERT INTO users(`username`,`email`,`password`) VALUES (?)",
      [[username, email, hashed]],
    );

    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "That username or email is already registered." });
    }
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration is temporarily unavailable." });
  }
};

export const login = async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = req.body?.password;

  if (!username || username.length > 50 || typeof password !== "string" || !password.length) {
    return res.status(400).json({ message: "Enter your username and password." });
  }
  if (!process.env.JWT_SECRET_KEY) {
    console.error("LOGIN ERROR: JWT_SECRET_KEY is not configured.");
    return res.status(500).json({ message: "Sign in is temporarily unavailable." });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
    const user = users[0];
    const isCorrect = user && await bcrypt.compare(password, user.password);

    if (!isCorrect) return res.status(401).json({ message: "Incorrect username or password." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
    const { password: _password, ...safeUser } = user;

    res.cookie("access_token", token, sessionCookieOptions(req));
    return res.status(200).json(safeUser);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Sign in is temporarily unavailable." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", sessionCookieOptions(req));
  return res.status(200).json({ message: "You are signed out." });
};
