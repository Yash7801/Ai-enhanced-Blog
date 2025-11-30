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

// SIMPLE UNIVERSAL CORS (works on Render!)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


// ---------------------------------------------
// 🔥 CLOUDINARY CONFIG (only new part)
// ---------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });


// 🔥 Replace your old upload route with Cloudinary upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json({ url: req.file.path }); // Cloudinary URL
});


// ---------------------------------------------------
// Keep ALL other routes EXACTLY the same
// ---------------------------------------------------
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
