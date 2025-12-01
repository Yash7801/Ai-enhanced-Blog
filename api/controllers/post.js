import { db } from "../db.js";
import jwt from "jsonwebtoken";

// ✅ Your REAL Railway backend URL
const backendURL =
  process.env.BACKEND_URL ||
  "https://ai-enhanced-blog-production.up.railway.app";

// ---------------------------------------------
// GET ALL POSTS
// ---------------------------------------------
export const getPosts = async (req, res) => {
  try {
    const q = req.query.cat
      ? "SELECT * FROM posts WHERE cat=?"
      : "SELECT * FROM posts";

    const params = req.query.cat ? [req.query.cat] : [];

    const [rows] = await db.query(q, params);

    // Add full image URL
    const formatted = rows.map((post) => ({
      ...post,
      img: post.img ? `${backendURL}/uploads/${post.img}` : null,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.log("GET POSTS ERROR:", err);
    return res.status(500).json(err);
  }
};

// ---------------------------------------------
// GET SINGLE POST
// ---------------------------------------------
export const getPost = async (req, res) => {
  try {
    const q = `
      SELECT p.id, u.username, p.title, p.description, p.img, p.cat, p.date
      FROM users u
      JOIN posts p ON u.id = p.uid
      WHERE p.id = ?
    `;

    const [data] = await db.query(q, [req.params.id]);

    if (!data.length) return res.status(404).json("Post not found");

    const post = data[0];

    // Add full image URL
    post.img = post.img ? `${backendURL}/uploads/${post.img}` : null;

    return res.status(200).json(post);
  } catch (err) {
    console.log("GET POST ERROR:", err);
    return res.status(500).json(err);
  }
};

// ---------------------------------------------
// ADD NEW POST
// ---------------------------------------------
export const addPost = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated");

    const userInfo = jwt.verify(token, "jwtkey");

    const q =
      "INSERT INTO posts(`title`, `description`, `img`, `cat`, `uid`) VALUES (?)";

    const values = [
      req.body.title,
      req.body.description,
      req.body.img, // filename only
      req.body.cat,
      userInfo.id,
    ];

    await db.query(q, [values]);

    return res.status(200).json("Post has been created.");
  } catch (err) {
    console.log("ADD POST ERROR:", err);
    return res.status(500).json(err);
  }
};

// ---------------------------------------------
// DELETE POST
// ---------------------------------------------
export const deletePost = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated");

    const userInfo = jwt.verify(token, "jwtkey");
    const postId = req.params.id;

    const q = "DELETE FROM posts WHERE `id`=? AND `uid`=?";

    await db.query(q, [postId, userInfo.id]);

    return res.json("Post has been deleted!");
  } catch (err) {
    console.log("DELETE POST ERROR:", err);
    return res.status(500).json(err);
  }
};

// ---------------------------------------------
// UPDATE POST
// ---------------------------------------------
export const updatePost = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated");

    const userInfo = jwt.verify(token, "jwtkey");
    const postId = req.params.id;

    const q =
      "UPDATE posts SET `title`=?, `description`=?, `img`=?, `cat`=? WHERE `id`=? AND `uid`=?";
    const values = [
      req.body.title,
      req.body.description,
      req.body.img, // filename only
      req.body.cat,
      postId,
      userInfo.id,
    ];

    await db.query(q, values);

    return res.status(200).json("Post has been updated.");
  } catch (err) {
    console.log("UPDATE POST ERROR:", err);
    return res.status(500).json(err);
  }
};
