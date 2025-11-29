import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
  const q = req.query.cat
    ? "SELECT * FROM posts WHERE cat=?"
    : "SELECT * FROM posts";
  const params = req.query.cat ? [req.query.cat] : [];

  db.query(q, params, (err, data) => {
    if (err) {
      console.log("GET POSTS DB ERROR:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  const q = `
    SELECT p.id, u.username, p.title, p.description, p.img, p.cat, p.date
    FROM users u
    JOIN posts p ON u.id = p.uid
    WHERE p.id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.log("GET POST DB ERROR:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data[0]);
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const q =
      "INSERT INTO posts(`title`, `description`, `img`, `cat`, `uid`) VALUES (?)";
    const values = [
      req.body.title,
      req.body.description,
      req.body.img,
      req.body.cat,
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.log("ADD POST DB ERROR:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");

    const posId = req.params.id;
    const q = "DELETE FROM posts WHERE `id`=? AND `uid`=?";

    db.query(q, [posId, userInfo.id], (err, data) => {
      if (err) {
        console.log("DELETE POST DB ERROR:", err);
        return res.status(500).json("It doesn't belong to you");
      }
      return res.json("Post has been deleted..!");
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");
    const postId = req.params.id;

    const q =
      "UPDATE posts SET `title`=?, `description`=?, `img`=?, `cat`=? WHERE `id`=? AND `uid`=?";
    const values = [
      req.body.title,
      req.body.description,
      req.body.img,
      req.body.cat,
    ];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) {
        console.log("UPDATE POST DB ERROR:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Post has been updated.");
    });
  });
};
