import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ? OR email = ?";
    const [existing] = await db.query(q, [req.body.username, req.body.email]);

    if (existing.length) {
      return res.status(409).json("User already exists!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q2 = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, hashedPassword];

    const [result] = await db.query(q2, [values]);

    res.status(201).json({
      id: result.insertId,
      username: req.body.username,
      email: req.body.email,
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json(err);
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const q = "SELECT * FROM users WHERE username = ?";
    const [data] = await db.query(q, [req.body.username]);

    if (data.length === 0) {
      return res.status(404).json("User not found!");
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong username or password!");
    }

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json(err);
  }
};

// LOGOUT
export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .status(200)
    .json("User has been logged out.");
};
