import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Choose a working model
const MODEL = "gemini-1.5-flash-latest";
// Alternative model (also works): const MODEL = "gemini-pro";

router.post("/", async (req, res) => {
  const { text } = req.body;

  // Safety: missing API key = return empty suggestion
  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ GEMINI_API_KEY missing");
    return res.status(200).json({ suggestion: "" });
  }

  // Safety: empty input
  if (!text || text.trim().length === 0) {
    return res.status(200).json({ suggestion: "" });
  }

  try {
    console.log("📩 Incoming suggestion request...");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an assistant helping continue a blog post. Continue this writing in a natural, human way (NOT too long, 2–3 sentences max):\n\n${text}`
              }
            ]
          }
        ]
      }
    );

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("✨ Suggestion generated.");
    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.response?.data || err.message);
    return res.status(200).json({ suggestion: "" }); // Never break UI
  }
});

export default router;
