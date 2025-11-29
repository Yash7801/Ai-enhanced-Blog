import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';

import suggestionRouter from './routes/suggestion.js';
import postsRouter from './routes/posts.js';
import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';

const app = express();

/* ------------------- CORS CONFIG ------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://axelblaze.vercel.app"
];

// Main CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Required preflight handling for Express 5
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Force Render to not block CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

/* ------------------- MIDDLEWARE ------------------- */

app.use(express.json());
app.use(cookieParser());
app.use("/upload", express.static("uploads"));

/* ------------------- FILE UPLOAD ------------------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json(req.file.filename);
});

/* ------------------- ROUTES ------------------- */

app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

/* ------------------- SERVER ------------------- */

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
