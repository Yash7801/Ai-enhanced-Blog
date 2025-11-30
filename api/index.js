import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

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

// Serve uploads
app.use("/upload", express.static("uploads"));

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json(req.file.filename);
});

// Routes
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});

