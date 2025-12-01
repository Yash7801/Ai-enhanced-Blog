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

// ===========================
//  CORS CONFIG (PERFECT + SAFE)
// ===========================
const allowedOrigins = [
  "https://blogpage-two-sigma.vercel.app",   // your main domain
  /\.vercel\.app$/                           // allow all Vercel preview domains
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||                                  // allow mobile apps / tools
        allowedOrigins.some((o) =>
          o instanceof RegExp ? o.test(origin) : o === origin
        )
      ) {
        callback(null, true);
      } else {
        console.log("❌ BLOCKED ORIGIN:", origin);
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// Manual headers (required for cookies on Render/Vercel)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    )
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  next();
});

app.use(express.json());
app.use(cookieParser());


// ===========================
//   CLOUDINARY CONFIG
// ===========================
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

// Upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });

  res.status(200).json({
    url: req.file.path || req.file.secure_url,
  });
});


// ===========================
//        ROUTES
// ===========================

app.use("/api/suggest", suggestionRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);


// ===========================
//        SERVER START
// ===========================

app.listen(process.env.PORT || 8800, () => {
  console.log("🔥 Backend running...");
});
