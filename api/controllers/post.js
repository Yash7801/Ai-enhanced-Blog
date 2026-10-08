import { db } from "../db.js";
import { authenticatedUserId } from "../utils/auth.js";

function validStoryInput(body) {
  return typeof body?.title === "string"
    && body.title.trim().length > 0
    && body.title.trim().length <= 200
    && typeof body.description === "string"
    && body.description.trim().length > 0
    && body.description.length <= 50000
    && typeof body.cat === "string"
    && body.cat.trim().length > 0
    && body.cat.trim().length <= 50
    && (body.img == null || (typeof body.img === "string" && body.img.length <= 2048));
}

function reportServerError(res, label, err) {
  console.error(`${label}:`, err);
  return res.status(500).json({ message: "The journal is temporarily unavailable." });
}

export const getPosts = async (req, res) => {
  try {
    const q = req.query.cat
      ? "SELECT p.*, u.username FROM posts p JOIN users u ON u.id = p.uid WHERE p.cat = ? ORDER BY p.date DESC"
      : "SELECT p.*, u.username FROM posts p JOIN users u ON u.id = p.uid ORDER BY p.date DESC";
    const params = req.query.cat ? [req.query.cat] : [];
    const [rows] = await db.query(q, params);
    return res.status(200).json(rows);
  } catch (err) {
    return reportServerError(res, "GET POSTS ERROR", err);
  }
};

export const getPost = async (req, res) => {
  try {
    const q = `
      SELECT p.id, p.uid, u.username, p.title, p.description, p.img, p.cat, p.date
      FROM users u
      JOIN posts p ON u.id = p.uid
      WHERE p.id = ?
    `;
    const [rows] = await db.query(q, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Story not found." });
    return res.status(200).json(rows[0]);
  } catch (err) {
    return reportServerError(res, "GET POST ERROR", err);
  }
};

export const addPost = async (req, res) => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  if (!validStoryInput(req.body)) {
    return res.status(400).json({ message: "Add a title, story, and category. Keep the title under 200 characters and story under 50,000." });
  }

  try {
    const values = [
      req.body.title.trim(),
      req.body.description,
      req.body.img || null,
      req.body.cat.trim(),
      userId,
    ];
    const [result] = await db.query(
      "INSERT INTO posts(`title`, `description`, `img`, `cat`, `uid`) VALUES (?)",
      [values],
    );
    return res.status(201).json({ id: result.insertId, message: "Story published." });
  } catch (err) {
    return reportServerError(res, "ADD POST ERROR", err);
  }
};

export const deletePost = async (req, res) => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;

  try {
    const [result] = await db.query(
      "DELETE FROM posts WHERE `id` = ? AND `uid` = ?",
      [req.params.id, userId],
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Story not found or no longer available to you." });
    return res.status(200).json({ message: "Story deleted." });
  } catch (err) {
    return reportServerError(res, "DELETE POST ERROR", err);
  }
};

export const updatePost = async (req, res) => {
  const userId = authenticatedUserId(req, res);
  if (!userId) return;
  if (!validStoryInput(req.body)) {
    return res.status(400).json({ message: "Add a title, story, and category. Keep the title under 200 characters and story under 50,000." });
  }

  try {
    const values = [
      req.body.title.trim(),
      req.body.description,
      req.body.img || null,
      req.body.cat.trim(),
      req.params.id,
      userId,
    ];
    const [result] = await db.query(
      "UPDATE posts SET `title` = ?, `description` = ?, `img` = ?, `cat` = ? WHERE `id` = ? AND `uid` = ?",
      values,
    );
    if (!result.affectedRows) {
      const [existing] = await db.query("SELECT id FROM posts WHERE id = ? AND uid = ? LIMIT 1", [req.params.id, userId]);
      if (!existing.length) return res.status(404).json({ message: "Story not found or no longer available to you." });
    }
    return res.status(200).json({ message: "Story updated." });
  } catch (err) {
    return reportServerError(res, "UPDATE POST ERROR", err);
  }
};
