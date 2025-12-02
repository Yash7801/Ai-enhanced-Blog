import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Routes
import suggestionRouter from "./routes/suggestion.js";
import postsRouter from "./routes/posts.js";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

// --------------------------------------------------
// TRUST PROXY (REQUIRED for Render + Cookies)
// --------------------------------------------------
app.set("trust proxy", 1);

// --------------------------------------------------
// CORS (FINAL + CORRECT)
// --------------------------------------------------
const FRONTEND_URL = "https://blogpage-two-sigma.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// --------------------------------------------------
// BODY + COOKIES
// --------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// CLOUDINARY CONFIG
// --------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --------------------------------------------------
// MULTER STORAGE
// --------------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// --------------------------------------------------
// UPLOAD ROUTE
// --------------------------------------------------
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.status(200).json({
    url: req.file.secure_url || req.file.path,
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// --------------------------------------------------
// SERVER START
// --------------------------------------------------
app.listen(process.env.PORT || 8800, () => {
  console.log("Server running on port", process.env.PORT || 8800);
});
