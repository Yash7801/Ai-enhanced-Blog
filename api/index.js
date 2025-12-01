import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import suggestionRouter from "./routes/suggestion.js";
import postsRouter from "./routes/posts.js";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

// CORS — PRODUCTION SAFE
app.use(cors({
  origin: "https://blogpage-two-sigma.vercel.app",
  credentials: true
}));

// Must add these headers for Render/Vercel cookie handling
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "https://blogpage-two-sigma.vercel.app");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

app.use(express.json());
app.use(cookieParser());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
  },
});

const upload = multer({ storage });

// Upload Route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });

  res.status(200).json({
    url: req.file.path || req.file.secure_url
  });
});

// Routes
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// Start
app.listen(process.env.PORT || 8800, () => {
  console.log("Server running");
});
