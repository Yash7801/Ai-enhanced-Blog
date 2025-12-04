import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const router = express.Router();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Model to use
const MODEL = "llama3-8b-8192";

router.post("/", async (req, res) => {
  const { text } = req.body;

  // Missing API key
  if (!process.env.GROQ_API_KEY) {
    console.log("❌ Missing GROQ_API_KEY");
    return res.status(200).json({ suggestion: "" });
  }

  // Empty text
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
            "Continue the user’s paragraph using 2–3 natural human sentences. Do NOT output blank text."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 120,
      temperature: 0.7
    });

    // ⭐ ADDED: LOG RAW GROQ RESPONSE
    console.log("🚀 RAW GROQ RESPONSE:", JSON.stringify(response, null, 2));

    const suggestion =
      response?.choices?.[0]?.message?.content?.trim() || "";

    // ⭐ ADDED: LOG FINAL SUGGESTION
    console.log("✨ FINAL SUGGESTION:", suggestion);

    return res.status(200).json({ suggestion });

  } catch (err) {
    console.error("🔥 GROQ ERROR:", err?.message || err);
    return res.status(200).json({ suggestion: "" });
  }
});

export default router;
