import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Correct working model
const MODEL = "gemini-1.5-flash";

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ GEMINI_API_KEY missing");
    return res.status(200).json({ suggestion: "" });
  }

  if (!text || text.trim().length === 0) {
    return res.status(200).json({ suggestion: "" });
  }

  try {
    console.log("📩 Suggestion request received...");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Continue this blog naturally in 2–3 sentences:\n\n${text}`
              }
            ]
          }
        ]
      }
    );

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("✨ Suggestion:", suggestion);

    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.response?.data || err.message);
    return res.status(200).json({ suggestion: "" });
  }
});

export default router;
