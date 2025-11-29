import express from 'express';
import suggestionRouter from './routes/suggestion.js';
import cors from 'cors';
import postsRouter from './routes/posts.js';
import userRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import multer from 'multer';

const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static uploads
app.use("/upload", express.static("uploads"));

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // FIXED path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use("/api/suggest", suggestionRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
