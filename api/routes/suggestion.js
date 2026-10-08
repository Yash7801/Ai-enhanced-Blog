import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const MODEL = "llama-3.1-8b-instant";

router.post("/", async (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "Write a little first to get a suggestion." });
  }
  if (text.length > 8000) {
    return res.status(413).json({ message: "Please send no more than 8,000 characters at a time." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ message: "The writing assistant is not configured right now." });
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Continue the user's blog paragraph naturally in 2–3 human-like sentences.",
        },
        { role: "user", content: text.trim() },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    const suggestion = response.choices?.[0]?.message?.content?.trim();
    if (!suggestion) {
      return res.status(502).json({ message: "The writing assistant returned no suggestion." });
    }
    return res.status(200).json({ suggestion });
  } catch (err) {
    console.error("GROQ SUGGESTION ERROR:", err);
    return res.status(502).json({ message: "The writing assistant is unavailable right now." });
  }
});

export default router;
