import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { requireAuth } from "./utils/auth.js";

// Routes
import suggestionRouter from "./routes/suggestion.js";
import postsRouter from "./routes/posts.js";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

app.set("trust proxy", true);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://blogpage-two-sigma.vercel.app";
const allowedOrigins = [
  FRONTEND_URL,
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://127.0.0.1:5173"]),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, and WEBP images are supported."));
    }
    return callback(null, true);
  },
});

app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose an image to upload." });

  return res.status(200).json({
    url: req.file.secure_url || req.file.path,
  });
});


app.use("/api/suggest", requireAuth, suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// Health check for UptimeRobot
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "Images must be 5 MB or smaller."
      : "The image could not be uploaded.";
    return res.status(400).json({ message });
  }
  if (err?.message === "Only JPG, PNG, and WEBP images are supported.") {
    return res.status(400).json({ message: err.message });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "That request is too large." });
  }
  if (err?.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: "The request could not be understood." });
  }
  console.error("REQUEST ERROR:", err);
  return res.status(500).json({ message: "The request could not be completed." });
});

app.listen(process.env.PORT || 8800, () => {
  console.log("Server running on port", process.env.PORT || 8800);
});
