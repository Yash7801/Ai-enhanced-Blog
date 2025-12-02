import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ⭐ Correct working model
const MODEL = "gemini-1.5-flash";

router.post("/", async (req, res) => {
  const { text } = req.body;

  // No API key = no suggestion
  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ Missing GEMINI_API_KEY");
    return res.status(200).json({ suggestion: "" });
  }

  // No input given
  if (!text || text.trim().length === 0) {
    return res.status(200).json({ suggestion: "" });
  }

  try {
    console.log("📩 Suggestion request received...");

    // ⭐ Correct endpoint (v1)
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `Continue this blog in 2–3 natural human sentences:\n\n${text}`
            }
          ]
        }
      ]
    });

    const suggestion =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("✨ Suggestion generated:", suggestion);

    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.response?.data || err.message);
    return res.status(200).json({ suggestion: "" });
  }
});

export default router;
