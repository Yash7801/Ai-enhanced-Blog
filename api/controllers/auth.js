import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ? OR email = ?";
    const [existing] = await db.query(q, [req.body.username, req.body.email]);

    if (existing.length) return res.status(409).json("User already exists!");

    const hashed = bcrypt.hashSync(req.body.password, 10);

    const q2 = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hashed];

    const [result] = await db.query(q2, [values]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json(err);
  }
};

// LOGIN
// LOGIN
export const login = async (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ?";
    const [users] = await db.query(q, [req.body.username]);

    if (!users.length) return res.status(404).json("User not found!");

    const user = users[0];
    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) return res.status(400).json("Wrong credentials!");

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    const { password, ...rest } = user;

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: "ai-enhanced-blog.onrender.com",   // ⭐ REQUIRED FIX
      path: "/"
    });

    res.status(200).json(rest);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json(err);
  }
};


// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: "ai-enhanced-blog.onrender.com",   // ⭐ REQUIRED FIX
    path: "/"
  });

  res.status(200).json("You are logged out");
};




