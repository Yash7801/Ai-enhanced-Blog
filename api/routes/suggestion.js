import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const router = express.Router();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ⭐ Supported and FREE model
const MODEL = "mixtral-8x7b-32768";

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
            "Continue the blog paragraph naturally in 2–3 human-sounding sentences."
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

    const suggestion = response?.choices?.[0]?.message?.content?.trim() || "";

    console.log("✨ FINAL SUGGESTION:", suggestion);

    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GROQ ERROR:", err?.response?.data || err);
    return res.status(200).json({ suggestion: "" });
  }
});

export default router;
