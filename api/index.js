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

/* ============================
   PERMANENT CORS CONFIG
   ============================ */

const FRONTEND_URL = "https://blogpage-two-sigma.vercel.app"; // your stable domain

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Required for cookies on Render + Vercel
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

/* ============================
   BASIC MIDDLEWARE
   ============================ */

app.use(express.json());
app.use(cookieParser());

/* ============================
   CLOUDINARY CONFIG
   ============================ */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads"
  },
});

const upload = multer({ storage });

/* ============================
   UPLOAD ROUTE (CLOUDINARY)
   ============================ */

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });

  res.status(200).json({
    url: req.file.path || req.file.secure_url
  });
});

/* ============================
   ROUTES
   ============================ */

app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

/* ============================
   START SERVER
   ============================ */

app.listen(process.env.PORT || 8800, () => {
  console.log("Server running");
});
