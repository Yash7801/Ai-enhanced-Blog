import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER (no cookie, just create user)
export const register = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(q, [req.body.username, req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q2 = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hashedPassword];

    db.query(q2, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      const userId = data.insertId;
      res.status(201).json({ id: userId, username: req.body.username, email: req.body.email });
    });
  });
};

// LOGIN (sets cookie)
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);
    if (!isPasswordCorrect) return res.status(400).json("Wrong username or password!");

    
    // Create JWT
    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
    .cookie("access_token", token, {
      httpOnly: true,
    })
    .status(200)
    .json(other);
  });
};

// LOGOUT (clears cookie)
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  }).status(200).json("User has been logged out.");
};
