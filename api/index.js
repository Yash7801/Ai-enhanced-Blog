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

// CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
// CLOUDINARY CONFIG
// ---------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// Upload Route (returns FULL Cloudinary URL)
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json({ url: req.file.path });
});

// ROUTES
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// START SERVER
app.listen(process.env.PORT || 8800, () => {
  console.log("Server running");
});
