import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

import suggestionRouter from "./routes/suggestion.js";
import postsRouter from "./routes/posts.js";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------
// 📌 MULTER DISK STORAGE (Railway)
// ---------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📌 Upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json({ filename: req.file.filename });
});

// 📌 Make uploads public
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
