import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Correct new model name
const MODEL = "gemini-1.5-flash-latest";

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ No GEMINI_API_KEY found");
    return res.json({ suggestion: "" });
  }

  if (!text || text.trim().length === 0) {
    return res.json({ suggestion: "" });
  }

  try {
    console.log("📩 Suggestion request received...");

    // 🚀 NEW WORKING ENDPOINT (NOTICE: no `/models/`)
    const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const result = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `Continue this blog naturally in 2 sentences:\n${text}`
            }
          ]
        }
      ]
    });

    const suggestion =
      result.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("✨ Suggestion:", suggestion);
    return res.json({ suggestion });

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.response?.data || err.message);
    return res.json({ suggestion: "" });
  }
});

export default router;
