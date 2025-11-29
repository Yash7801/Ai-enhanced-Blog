import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import suggestionRouter from './routes/suggestion.js';
import postsRouter from './routes/posts.js';
import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';

const app = express();

/* ✅ FIXED CORS */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://axelblaze.vercel.app"   // for later when you deploy frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* Required to process JSON + cookies */
app.use(express.json());
app.use(cookieParser());
app.use("/upload", express.static("uploads"));

/* File Upload */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json(req.file.filename);
});

/* Routes */
app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

/* Server */
const PORT = process.env.PORT || 5200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
