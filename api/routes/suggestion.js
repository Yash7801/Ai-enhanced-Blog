import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ⭐ WORKING MODEL (Dec 2025)
const MODEL = "gemma2-9b-it";

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!process.env.GROQ_API_KEY) {
    console.log("❌ Missing GROQ_API_KEY");
    return res.status(200).json({ suggestion: "" });
  }

  if (!text || text.trim().length === 0) {
    return res.status(200).json({ suggestion: "" });
  }

  try {
    console.log("📩 Suggestion request received...");

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Continue the user's blog paragraph naturally in 2–3 human-like sentences."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    console.log("🚀 RAW GROQ RESPONSE:", JSON.stringify(response, null, 2));

    const suggestion =
      response?.choices?.[0]?.message?.content?.trim() || "";

    console.log("✨ FINAL SUGGESTION:", suggestion);

    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GROQ ERROR:", err?.response?.data || err);
    return res.status(200).json({ suggestion: "" });
  }
});

export default router;
