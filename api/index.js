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

// ---------------------------------------------
//  CORS CONFIG (Chrome + Vercel + Render SAFE)
// ---------------------------------------------
const FRONTEND_URL = "https://blogpage-two-sigma.vercel.app";

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

// Apply global CORS
app.use(cors(corsOptions));

// ⭐ EXPRESS v5 SAFE PRE-FLIGHT: NO WILDCARD CRASH ⭐
app.options("*", cors(corsOptions));   // <-- SAFE & REQUIRED

// ---------------------------------------------
// JSON + Cookies
// ---------------------------------------------
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
//  CLOUDINARY CONFIG
// ---------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ---------------------------------------------
// MULTER + CLOUDINARY STORAGE
// ---------------------------------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// UPLOAD ROUTE
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.status(200).json({
    url: req.file.path || req.file.secure_url,
  });
});

// ---------------------------------------------
//  API ROUTES
// ---------------------------------------------
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// ---------------------------------------------
//  404 HANDLER (SAFE)
// ---------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ---------------------------------------------
//  SERVER START
// ---------------------------------------------
app.listen(process.env.PORT || 8800, () => {
  console.log("Server running...");
});
